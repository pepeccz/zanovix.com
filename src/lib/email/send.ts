/**
 * send.ts — modulo de envio de email transaccional (server-only)
 *
 * Aislado del resto para poder cambiar de proveedor sin tocar el endpoint
 * ni el formulario. Implementacion actual: Resend (API REST, sin SDK).
 *
 * Degradacion honesta (decision sdd/captacion-ia/config): el modulo se
 * construye YA aunque la clave de Resend aun no este conectada. Si no hay
 * RESEND_API_KEY, o si la llamada falla, NO lanza: devuelve un resultado
 * { delivered: false } con motivo, para que el endpoint y el formulario
 * muestren el fallback al email directo (nunca un callejon sin salida).
 *
 * SERVER-ONLY: lee import.meta.env (claves de servidor). No debe importarse
 * jamas desde codigo de cliente. Se usa solo dentro de rutas SSR
 * (prerender = false).
 */

/** Email directo de fallback, visible cuando el envio no esta disponible. */
export const FALLBACK_EMAIL = 'hola@zanovix.com'

/** Direccion de envio por defecto (dominio verificado en Resend en prod). */
const DEFAULT_FROM = 'Zanovix <hola@zanovix.com>'

/** Endpoint REST de Resend. */
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

/** Datos minimos de un lead listos para componer el email. */
export interface LeadPayload {
  name: string
  email: string
  /** Empresa o mensaje libre del visitante. */
  message: string
  /** Contexto inferido por el Companion (puede venir vacio). */
  context?: {
    sector?: string
    pain?: string
    urgency?: string
    raw?: string
  }
}

/**
 * Resultado honesto del intento de envio. `delivered: false` no es un error
 * fatal: significa que el lead no se entrego por email y hay que ofrecer el
 * fallback. `reason` documenta por que (sin clave, error de proveedor, etc.).
 */
export interface SendResult {
  delivered: boolean
  reason?: 'not-configured' | 'provider-error' | 'network-error'
  /** Email directo a mostrar como via alternativa cuando delivered es false. */
  fallbackEmail: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Construye el asunto, incluyendo el sector si el Companion lo infirio. */
function buildSubject(lead: LeadPayload): string {
  const sector = lead.context?.sector?.trim()
  return sector ? `Nuevo lead Zanovix: ${sector}` : 'Nuevo lead Zanovix'
}

/** Cuerpo en texto plano, voz anti-hype, sin guiones largos. */
function buildText(lead: LeadPayload): string {
  const c = lead.context
  const lines = [
    'Nuevo contacto desde zanovix.com',
    '',
    `Nombre: ${lead.name}`,
    `Email: ${lead.email}`,
    '',
    'Mensaje:',
    lead.message || '(sin mensaje)',
  ]
  if (c && (c.sector || c.pain || c.urgency || c.raw)) {
    lines.push('', 'Contexto del asistente:')
    if (c.sector) lines.push(`  Sector: ${c.sector}`)
    if (c.pain) lines.push(`  Lo que mas pesa: ${c.pain}`)
    if (c.urgency) lines.push(`  Como lo vive: ${c.urgency}`)
    if (c.raw) lines.push(`  En sus palabras: ${c.raw}`)
  }
  return lines.join('\n')
}

/** Cuerpo HTML simple y plano, coherente con la voz de marca. */
function buildHtml(lead: LeadPayload): string {
  const c = lead.context
  const row = (label: string, value: string) =>
    `<p style="margin:0 0 0.5rem"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`

  let contextBlock = ''
  if (c && (c.sector || c.pain || c.urgency || c.raw)) {
    const parts = [
      '<h2 style="font-size:1rem;margin:1.5rem 0 0.75rem">Contexto del asistente</h2>',
    ]
    if (c.sector) parts.push(row('Sector', c.sector))
    if (c.pain) parts.push(row('Lo que mas pesa', c.pain))
    if (c.urgency) parts.push(row('Como lo vive', c.urgency))
    if (c.raw) parts.push(row('En sus palabras', c.raw))
    contextBlock = parts.join('')
  }

  return [
    '<div style="font-family:system-ui,sans-serif;color:#1F2A26;line-height:1.6">',
    '<h1 style="font-size:1.125rem;margin:0 0 1rem">Nuevo contacto desde zanovix.com</h1>',
    row('Nombre', lead.name),
    row('Email', lead.email),
    '<h2 style="font-size:1rem;margin:1.5rem 0 0.75rem">Mensaje</h2>',
    `<p style="margin:0;white-space:pre-wrap">${escapeHtml(lead.message || '(sin mensaje)')}</p>`,
    contextBlock,
    '</div>',
  ].join('')
}

/**
 * Envia el lead por email. Nunca lanza: devuelve siempre un SendResult.
 *
 * Comportamiento sin clave (caso actual): devuelve delivered=false con
 * reason='not-configured' para que el formulario muestre el fallback honesto.
 */
export async function sendLead(lead: LeadPayload): Promise<SendResult> {
  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined
  const to = (import.meta.env.LEAD_TO_EMAIL as string | undefined) || FALLBACK_EMAIL
  const from = (import.meta.env.LEAD_FROM_EMAIL as string | undefined) || DEFAULT_FROM

  if (!apiKey) {
    return { delivered: false, reason: 'not-configured', fallbackEmail: to }
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: lead.email,
        subject: buildSubject(lead),
        text: buildText(lead),
        html: buildHtml(lead),
      }),
    })

    if (!res.ok) {
      return { delivered: false, reason: 'provider-error', fallbackEmail: to }
    }

    return { delivered: true, fallbackEmail: to }
  } catch {
    return { delivered: false, reason: 'network-error', fallbackEmail: to }
  }
}
