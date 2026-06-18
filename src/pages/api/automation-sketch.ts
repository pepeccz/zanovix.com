/**
 * api/automation-sketch.ts — endpoint SSR del esbozo de automatizacion (POST)
 *
 * Recibe una tarea repetitiva descrita por el visitante y pregunta a un modelo
 * de IA (via OpenRouter) que parte se podria automatizar, con que enfoque a
 * grandes rasgos y con que avisos honestos. Devuelve la RESPUESTA REAL del
 * modelo, parseada a AutomationSketch. EL PRODUCTO ES LA HONESTIDAD: el prompt
 * prohibe plazos, precios y cifras inventadas (ver sketch.ts).
 *
 * Ruta on-demand (prerender = false). El resto del sitio sigue estatico.
 *
 * Integracion OpenRouter (API compatible con OpenAI):
 *   POST https://openrouter.ai/api/v1/chat/completions
 *   Authorization: Bearer OPENROUTER_API_KEY
 *   Headers recomendados: HTTP-Referer, X-Title (atribucion en OpenRouter).
 *
 * Anti-abuso / coste:
 *   - Longitud minima y maxima de entrada (SKETCH_INPUT_MIN/MAX).
 *   - Rate limit en memoria por IP (no sobrevive a reinicio ni multi-instancia;
 *     suficiente para SSR single-instance, mismo patron que api/geo-snapshot).
 *   - Timeout de la llamada (SKETCH_TIMEOUT_MS) via AbortController.
 *   - Respuesta acotada (SKETCH_MAX_TOKENS).
 *
 * Degradacion HONESTA: sin OPENROUTER_API_KEY, o ante error/timeout/parseo
 * invalido, NO crashea: devuelve { source: 'fallback' } con un aviso honesto y
 * deja que el cliente muestre el mensaje + CTA a contacto. Nunca un error feo
 * ni una pantalla en blanco.
 */

import type { APIRoute } from 'astro'
import { runtimeEnv } from '../../lib/runtime-env'
import {
  SKETCH_MODEL_ID,
  SKETCH_INPUT_MIN,
  SKETCH_MAX_TOKENS,
  SKETCH_TIMEOUT_MS,
  SKETCH_SYSTEM_PROMPT,
  buildSketchUserPrompt,
  sanitizeSketchInput,
} from '../../lib/automation/sketch'
import type { AutomationSketch } from '../../lib/automation/sketch'

export const prerender = false

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

// ─── Rate limit en memoria (mismo patron que api/geo-snapshot.ts) ────────────

const RATE_LIMIT_MAX = 6 // peticiones permitidas...
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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

/** Aviso honesto comun cuando no podemos generar el esbozo en vivo. */
const FALLBACK_NOTICE =
  'Ahora mismo no puedo dibujarte el esbozo en vivo. Si quieres, cuentanos la tarea y lo miramos contigo sin compromiso.'

function fallback(notice = FALLBACK_NOTICE): Response {
  return json({ source: 'fallback', sketch: null, fallbackNotice: notice })
}

// ─── Parseo defensivo de la respuesta del modelo ─────────────────────────────

/**
 * Extrae el primer objeto JSON del texto del modelo y lo valida como
 * AutomationSketch. Si el modelo añadiera texto alrededor (no deberia, el
 * prompt lo prohibe), recortamos al primer { ... } balanceado de forma simple.
 */
function parseSketch(content: string): AutomationSketch | null {
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  let obj: Record<string, unknown>
  try {
    obj = JSON.parse(content.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    return null
  }

  const verdict = obj.verdict
  const automatable = typeof obj.automatable === 'string' ? obj.automatable.trim() : ''
  const approach = typeof obj.approach === 'string' ? obj.approach.trim() : ''
  const caveats = typeof obj.caveats === 'string' ? obj.caveats.trim() : ''

  if (!automatable || !approach || !caveats) return null
  const normalizedVerdict: AutomationSketch['verdict'] =
    verdict === 'yes' || verdict === 'partial' || verdict === 'no' || verdict === 'unclear'
      ? verdict
      : 'unclear'

  return { verdict: normalizedVerdict, automatable, approach, caveats }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, clientAddress, site }) => {
  if (isRateLimited(clientKey(request, clientAddress))) {
    return fallback(
      'Has pedido varios esbozos seguidos. Espera un momento; mientras, cuentanos la tarea en contacto y lo vemos contigo.',
    )
  }

  // Lectura de entrada (solo JSON: este endpoint lo llama siempre el cliente).
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return fallback()
  }

  const input = sanitizeSketchInput({ task: body.task as string })

  // Sin una tarea util no hay nada que esbozar: la tarea es el unico eje.
  if (input.task.length < SKETCH_INPUT_MIN) {
    return fallback(
      'Necesito que me cuentes un poco mas sobre la tarea para poder esbozar algo util. Cuanto mas concreto, mejor.',
    )
  }

  // Clave leida en RUNTIME (process.env primero), no inlineada en build; asi en
  // produccion funciona con el entorno del servidor sin rebuild.
  const apiKey = runtimeEnv('OPENROUTER_API_KEY')
  if (!apiKey) {
    // Sin clave: degradacion honesta con CTA a contacto en el cliente.
    return fallback()
  }

  // Atribucion recomendada por OpenRouter (no es obligatoria pero ayuda).
  const referer = site?.toString() || 'https://zanovix.com'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SKETCH_TIMEOUT_MS)

  try {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': referer,
        'X-Title': 'Zanovix - esbozo de automatizacion',
      },
      body: JSON.stringify({
        model: SKETCH_MODEL_ID,
        max_tokens: SKETCH_MAX_TOKENS,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SKETCH_SYSTEM_PROMPT },
          { role: 'user', content: buildSketchUserPrompt(input) },
        ],
      }),
    })

    if (!res.ok) {
      return fallback()
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content
    if (!content) return fallback()

    const sketch = parseSketch(content)
    if (!sketch) return fallback()

    return json({ source: 'live', sketch })
  } catch {
    // Timeout (abort) o error de red: degradacion honesta.
    return fallback()
  } finally {
    clearTimeout(timer)
  }
}
