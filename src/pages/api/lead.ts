/**
 * api/lead.ts — endpoint SSR de captacion de leads (POST)
 *
 * Recibe el formulario de /contacto (y el cierre del Companion), valida,
 * filtra bots y envia el lead por email via el modulo aislado de envio.
 *
 * Esta ruta es on-demand (prerender = false). El resto del sitio sigue
 * prerenderizado estatico: cada ruta opta por SSR individualmente, no se
 * cambia el output global del proyecto.
 *
 * Anti-spam (sin captcha de terceros, decision del plan):
 *   - honeypot: campo oculto "company_url" que un humano deja vacio.
 *   - rate limit basico en memoria por IP. LIMITACION CONOCIDA: la ventana
 *     vive en el proceso, asi que no sobrevive a reinicios ni se comparte
 *     entre instancias. Es suficiente para el SSR single-instance actual
 *     (riesgo R6 del plan); si se escala, mover a un store compartido.
 *
 * Respuesta: JSON honesto { ok, delivered, fallbackEmail, errors? }.
 *   - ok: la peticion era valida y se proceso.
 *   - delivered: el email salio de verdad (false si aun no hay clave Resend).
 *   - fallbackEmail: email directo a mostrar cuando delivered es false.
 */

import type { APIRoute } from 'astro'
import { sendLead, FALLBACK_EMAIL } from '../../lib/email/send'
import type { LeadPayload } from '../../lib/email/send'

export const prerender = false

// ─── Rate limit en memoria ──────────────────────────────────────────────────
// Ventana deslizante simple por IP. Vive en el proceso (ver nota de cabecera).

const RATE_LIMIT_MAX = 5 // peticiones permitidas...
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
  // Detras de proxy/CDN se usa el primer XFF; si no, la IP del socket.
  const xff = request.headers.get('x-forwarded-for')
  const ip = xff?.split(',')[0]?.trim() || clientAddress || 'unknown'
  return ip
}

// ─── Validacion ─────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  name?: string
  email?: string
  message?: string
  consent?: string
}

function validate(fields: {
  name: string
  email: string
  message: string
  consent: boolean
}): FieldErrors {
  const errors: FieldErrors = {}
  if (!fields.name || fields.name.trim().length < 2) {
    errors.name = 'Dime tu nombre para saber con quien hablo.'
  }
  if (!fields.email || !EMAIL_RE.test(fields.email.trim())) {
    errors.email = 'Necesito un email valido para poder responderte.'
  }
  if (!fields.message || fields.message.trim().length < 5) {
    errors.message = 'Cuentame algo de tu caso, aunque sea una linea.'
  }
  if (!fields.consent) {
    errors.consent = 'Necesito tu consentimiento para poder responderte.'
  }
  return errors
}

// ─── Lectura del cuerpo (JSON desde fetch, o form-urlencoded sin JS) ─────────

interface RawLead {
  name: string
  email: string
  message: string
  consent: boolean
  honeypot: string
  origin?: string
  context?: LeadPayload['context']
}

async function readBody(request: Request): Promise<RawLead> {
  const ct = request.headers.get('content-type') || ''

  if (ct.includes('application/json')) {
    const data = (await request.json()) as Record<string, unknown>
    return {
      name: String(data.name ?? ''),
      email: String(data.email ?? ''),
      message: String(data.message ?? ''),
      consent: data.consent === true || data.consent === 'on' || data.consent === 'true',
      honeypot: String(data.company_url ?? ''),
      origin: data.origin ? String(data.origin) : undefined,
      context:
        data.context && typeof data.context === 'object'
          ? (data.context as LeadPayload['context'])
          : undefined,
    }
  }

  // Fallback sin JS: form-urlencoded (POST nativo del <form>).
  const form = await request.formData()
  const get = (k: string) => String(form.get(k) ?? '')
  return {
    name: get('name'),
    email: get('email'),
    message: get('message'),
    consent: form.get('consent') === 'on' || form.get('consent') === 'true',
    honeypot: get('company_url'),
    origin: get('origin') || undefined,
    context: {
      sector: get('ctx_sector') || undefined,
      pain: get('ctx_pain') || undefined,
      urgency: get('ctx_urgency') || undefined,
      raw: get('ctx_raw') || undefined,
    },
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

// ─── Handler ────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limit antes de procesar nada pesado.
  if (isRateLimited(clientKey(request, clientAddress))) {
    return json(
      {
        ok: false,
        delivered: false,
        fallbackEmail: FALLBACK_EMAIL,
        error: 'Has enviado varios mensajes seguidos. Espera un momento y vuelve a intentarlo.',
      },
      429,
    )
  }

  let raw: RawLead
  try {
    raw = await readBody(request)
  } catch {
    return json(
      { ok: false, delivered: false, fallbackEmail: FALLBACK_EMAIL, error: 'No pude leer el formulario.' },
      400,
    )
  }

  // Honeypot: si el campo oculto trae algo, es un bot. Respondemos 200 "ok"
  // sin enviar nada (no le damos pistas al bot de que lo hemos detectado).
  if (raw.honeypot.trim() !== '') {
    return json({ ok: true, delivered: false, fallbackEmail: FALLBACK_EMAIL })
  }

  const errors = validate({
    name: raw.name,
    email: raw.email,
    message: raw.message,
    consent: raw.consent,
  })
  if (Object.keys(errors).length > 0) {
    return json({ ok: false, delivered: false, fallbackEmail: FALLBACK_EMAIL, errors }, 422)
  }

  const result = await sendLead({
    name: raw.name.trim(),
    email: raw.email.trim(),
    message: raw.message.trim(),
    origin: raw.origin,
    context: raw.context,
  })

  return json({
    ok: true,
    delivered: result.delivered,
    fallbackEmail: result.fallbackEmail,
  })
}
