/**
 * api/geo-snapshot.ts — endpoint SSR de la radiografia GEO (POST)
 *
 * Recibe la descripcion del negocio del visitante (+ sector/zona opcionales)
 * y pregunta a un modelo de IA (via OpenRouter) que sabe HOY de ese negocio
 * y si lo recomendaria. Devuelve la RESPUESTA REAL del modelo, parseada a
 * GeoSnapshot. EL PRODUCTO ES LA HONESTIDAD: no se fabrica nada (ver geo.ts).
 *
 * Ruta on-demand (prerender = false). El resto del sitio sigue estatico.
 *
 * Integracion OpenRouter (API compatible con OpenAI):
 *   POST https://openrouter.ai/api/v1/chat/completions
 *   Authorization: Bearer OPENROUTER_API_KEY
 *   Headers recomendados: HTTP-Referer, X-Title (atribucion en OpenRouter).
 *
 * Anti-abuso / coste:
 *   - Longitud maxima de entrada (GEO_INPUT_MAX) y campos (GEO_FIELD_MAX).
 *   - Rate limit en memoria por IP (LIMITACION R6: no sobrevive a reinicio
 *     ni multi-instancia; suficiente para SSR single-instance).
 *   - Timeout de la llamada (GEO_TIMEOUT_MS) via AbortController.
 *   - Respuesta acotada (GEO_MAX_TOKENS).
 *
 * Degradacion HONESTA: sin OPENROUTER_API_KEY, o ante error/timeout/parseo
 * invalido, NO crashea: devuelve { source: 'fallback' } con un aviso honesto
 * y deja que el cliente caiga al modo determinista v1 (reglas). Nunca un
 * error feo ni una pantalla en blanco.
 *
 * IMPORTANTE: esto refleja el CONOCIMIENTO del modelo (su entrenamiento), no
 * una auditoria en vivo de la web. El aviso al usuario y /privacidad lo dicen.
 */

import type { APIRoute } from 'astro'
import {
  GEO_MODEL_ID,
  GEO_INPUT_MAX,
  GEO_MAX_TOKENS,
  GEO_TIMEOUT_MS,
  GEO_SYSTEM_PROMPT,
  buildGeoUserPrompt,
  sanitizeGeoInput,
} from '../../lib/companion/geo'
import type { GeoSnapshot } from '../../lib/companion/geo'

export const prerender = false

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

// ─── Rate limit en memoria (igual patron que api/lead.ts, ver R6) ────────────

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

/** Aviso honesto comun cuando caemos al modo determinista. */
const FALLBACK_NOTICE =
  'Ahora mismo no puedo preguntarle en vivo a una IA, asi que te muestro lo que deduzco con reglas. Es una aproximacion mas simple.'

function fallback(notice = FALLBACK_NOTICE): Response {
  return json({ source: 'fallback', snapshot: null, fallbackNotice: notice })
}

// ─── Parseo defensivo de la respuesta del modelo ─────────────────────────────

/**
 * Extrae el primer objeto JSON del texto del modelo y lo valida como
 * GeoSnapshot. Si el modelo añadiera texto alrededor (no deberia, el prompt
 * lo prohibe), recortamos al primer { ... } balanceado de forma simple.
 */
function parseSnapshot(content: string): GeoSnapshot | null {
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  let obj: Record<string, unknown>
  try {
    obj = JSON.parse(content.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    return null
  }

  const known = obj.known
  const describes = typeof obj.describes === 'string' ? obj.describes.trim() : ''
  const recommend = typeof obj.recommend === 'string' ? obj.recommend.trim() : ''
  const gap = typeof obj.gap === 'string' ? obj.gap.trim() : ''

  if (!describes || !recommend || !gap) return null
  const normalizedKnown: GeoSnapshot['known'] =
    known === 'yes' || known === 'no' || known === 'unclear' ? known : 'unclear'

  return { known: normalizedKnown, describes, recommend, gap }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, clientAddress, site }) => {
  if (isRateLimited(clientKey(request, clientAddress))) {
    return fallback(
      'Has pedido varias radiografias seguidas. Espera un momento; mientras, te muestro lo que deduzco con reglas.',
    )
  }

  // Lectura de entrada (solo JSON: este endpoint lo llama siempre el cliente).
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return fallback()
  }

  const input = sanitizeGeoInput({
    description: body.description as string,
    sector: body.sector as string,
    zone: body.zone as string,
  })

  // Sin descripcion util no hay nada que preguntar: que el cliente use reglas.
  if (input.description.length < 3) {
    return fallback()
  }
  if (input.description.length > GEO_INPUT_MAX) {
    input.description = input.description.slice(0, GEO_INPUT_MAX)
  }

  const apiKey = import.meta.env.OPENROUTER_API_KEY as string | undefined
  if (!apiKey) {
    // Caso actual (sin clave): degradacion honesta al modo determinista.
    return fallback()
  }

  // Atribucion recomendada por OpenRouter (no es obligatoria pero ayuda).
  const referer = site?.toString() || 'https://zanovix.com'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS)

  try {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': referer,
        'X-Title': 'Zanovix - radiografia GEO',
      },
      body: JSON.stringify({
        model: GEO_MODEL_ID,
        max_tokens: GEO_MAX_TOKENS,
        temperature: 0.2,
        messages: [
          { role: 'system', content: GEO_SYSTEM_PROMPT },
          { role: 'user', content: buildGeoUserPrompt(input) },
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

    const snapshot = parseSnapshot(content)
    if (!snapshot) return fallback()

    return json({ source: 'live', snapshot })
  } catch {
    // Timeout (abort) o error de red: degradacion honesta.
    return fallback()
  } finally {
    clearTimeout(timer)
  }
}
