/**
 * api/assistant.ts — endpoint SSR del asistente global (POST)
 *
 * Conversa con un LLM real via OpenRouter (API compatible con OpenAI) usando un
 * system prompt GROUNDED en datos reales de Zanovix (ver assistant.ts) para no
 * alucinar. Devuelve la respuesta en STREAMING (text/plain por chunks) para
 * mejor sensacion; el cliente la pinta token a token. Si el streaming falla,
 * se degrada a una respuesta completa.
 *
 * Ruta on-demand (prerender = false). El resto del sitio sigue estatico.
 *
 * CLAVE EN RUNTIME: la API key se lee con runtimeEnv('OPENROUTER_API_KEY')
 * (process.env primero), no con import.meta.env inlineado en build. Asi en
 * produccion funciona con el entorno del servidor sin rebuild.
 *
 * Anti-abuso / coste:
 *   - Longitud maxima del mensaje (ASSISTANT_INPUT_MAX) y del historial
 *     (ASSISTANT_MAX_HISTORY) saneados en assistant.ts.
 *   - Maximo de turnos del visitante por peticion (ASSISTANT_MAX_USER_TURNS).
 *   - Rate limit en memoria por IP (LIMITACION: no sobrevive a reinicio ni
 *     multi-instancia; suficiente para SSR single-instance, riesgo R6).
 *   - Timeout (ASSISTANT_TIMEOUT_MS) via AbortController.
 *   - Respuesta acotada (ASSISTANT_MAX_TOKENS).
 *
 * Degradacion HONESTA: sin OPENROUTER_API_KEY, error, timeout o rate limit, NO
 * crashea: devuelve un mensaje honesto (text/plain) que invita a escribir al
 * equipo, con la cabecera X-Assistant-Degraded: 1 para que el cliente muestre
 * un CTA al contacto. Nunca una pantalla en blanco ni un error feo.
 */

import type { APIRoute } from 'astro'
import { runtimeEnv } from '../../lib/runtime-env'
import {
  ASSISTANT_MODEL_ID,
  ASSISTANT_MAX_TOKENS,
  ASSISTANT_MAX_USER_TURNS,
  ASSISTANT_TIMEOUT_MS,
  ASSISTANT_SYSTEM_PROMPT,
  sanitizeMessage,
  sanitizeHistory,
} from '../../lib/assistant/assistant'
import type { ChatMessage } from '../../lib/assistant/assistant'

export const prerender = false

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

// ─── Rate limit en memoria (mismo patron que api/lead.ts y geo-snapshot.ts) ──

const RATE_LIMIT_MAX = 30 // peticiones permitidas...
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // ...por cada 10 minutos
const hits = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > RATE_LIMIT_MAX
}

function clientKey(request: Request, clientAddress: string | undefined): string {
  const xff = request.headers.get('x-forwarded-for')
  return xff?.split(',')[0]?.trim() || clientAddress || 'unknown'
}

/** Respuesta degradada honesta en texto plano (el cliente muestra CTA contacto). */
function degraded(
  message = 'Ahora mismo no puedo responderte en vivo. Si quieres, escribenos y te contesta una persona del equipo en menos de 24h habiles.',
): Response {
  return new Response(message, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-assistant-degraded': '1',
      'cache-control': 'no-store',
    },
  })
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, clientAddress, site }) => {
  if (isRateLimited(clientKey(request, clientAddress))) {
    return degraded(
      'Has escrito varios mensajes muy seguidos. Espera un momento. Si tienes prisa, escribenos y te responde una persona.',
    )
  }

  // Lectura de entrada (solo JSON: este endpoint lo llama siempre el cliente).
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return degraded()
  }

  const message = sanitizeMessage(body.message)
  if (!message) {
    return degraded('No he recibido tu mensaje. Prueba a escribirlo otra vez.')
  }

  const history = sanitizeHistory(body.history)

  // Limite de turnos del visitante por sesion (el ultimo mensaje incluido).
  const userTurns = history.filter((m) => m.role === 'user').length + 1
  if (userTurns > ASSISTANT_MAX_USER_TURNS) {
    return degraded(
      'Hemos charlado bastante por aqui. Para seguir bien, lo mejor es que lo veamos contigo: escribenos y te responde una persona.',
    )
  }

  const apiKey = runtimeEnv('OPENROUTER_API_KEY')
  if (!apiKey) {
    // Sin clave en runtime: degradacion honesta.
    return degraded()
  }

  // Mensajes: system grounded + historial saneado + el nuevo turno del usuario.
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
    ...history.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  const referer = site?.toString() || 'https://zanovix.com'
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ASSISTANT_TIMEOUT_MS)

  let upstream: Response
  try {
    upstream = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': referer,
        'X-Title': 'Zanovix - asistente',
      },
      body: JSON.stringify({
        model: ASSISTANT_MODEL_ID,
        max_tokens: ASSISTANT_MAX_TOKENS,
        temperature: 0.4,
        stream: true,
        messages,
      }),
    })
  } catch {
    clearTimeout(timer)
    // Timeout (abort) o error de red: degradacion honesta.
    return degraded()
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timer)
    return degraded()
  }

  // ─── Re-stream: parseamos el SSE de OpenRouter y emitimos solo el texto ────
  // El cliente recibe text/plain por chunks (sin tener que parsear SSE).
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''
  let emittedAny = false

  const stream = new ReadableStream<Uint8Array>({
    async start(streamController) {
      const reader = upstream.body!.getReader()
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          // SSE: eventos separados por doble salto de linea; lineas "data: ...".
          const events = buffer.split('\n\n')
          buffer = events.pop() ?? ''
          for (const evt of events) {
            for (const line of evt.split('\n')) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data:')) continue
              const data = trimmed.slice(5).trim()
              if (data === '[DONE]') continue
              try {
                const json = JSON.parse(data) as {
                  choices?: { delta?: { content?: string } }[]
                }
                const delta = json.choices?.[0]?.delta?.content
                if (delta) {
                  emittedAny = true
                  streamController.enqueue(encoder.encode(delta))
                }
              } catch {
                // Linea de SSE no JSON (keep-alive/comentario): ignorar.
              }
            }
          }
        }

        // Si el upstream no emitio nada util, degradamos de forma honesta.
        if (!emittedAny) {
          streamController.enqueue(
            encoder.encode(
              'No he podido componer una respuesta ahora mismo. Escribenos y te contesta una persona del equipo.',
            ),
          )
        }
      } catch {
        // Error a mitad del stream: cerramos con un cierre honesto si no hubo nada.
        if (!emittedAny) {
          streamController.enqueue(
            encoder.encode(
              'Se ha cortado la respuesta. Si quieres, escribenos y lo vemos contigo.',
            ),
          )
        }
      } finally {
        clearTimeout(timer)
        try {
          reader.releaseLock()
        } catch {
          // sin-op
        }
        streamController.close()
      }
    },
    cancel() {
      clearTimeout(timer)
      controller.abort()
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
    },
  })
}
