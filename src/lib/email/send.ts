/**
 * send.ts — modulo de envio de email transaccional (server-only)
 *
 * Aislado del resto para poder cambiar de proveedor sin tocar el endpoint
 * ni el formulario. Implementacion actual: Nodemailer + Gmail SMTP
 * (Google Workspace).
 *
 * QUE DEBE MONTAR EL USUARIO (una de estas dos vias):
 *
 *   Via A (recomendada, sin tocar el admin del Workspace): App Password.
 *     1. La cuenta del Workspace que envia (p.ej. info@zanovix.com) debe
 *        tener la verificacion en dos pasos (2FA) ACTIVADA.
 *     2. Crear una App Password en
 *        https://myaccount.google.com/apppasswords
 *        (16 caracteres, sin espacios).
 *     3. Definir las env vars:
 *          SMTP_USER = info@zanovix.com
 *          SMTP_PASS = <la app password de 16 caracteres>
 *        SMTP_HOST y SMTP_PORT usan los defaults (smtp.gmail.com:465, SSL).
 *
 *   Via B (relay del Workspace, requiere config de admin): SMTP relay.
 *     1. En la consola de admin de Google Workspace, configurar el
 *        "SMTP relay service" autorizando la IP del servidor (o auth SMTP).
 *     2. Definir:
 *          SMTP_HOST = smtp-relay.gmail.com
 *          SMTP_PORT = 465
 *          SMTP_USER / SMTP_PASS segun la politica de auth elegida.
 *
 *   Opcional en ambas vias:
 *     LEAD_TO_EMAIL   destino de los leads (default info@zanovix.com)
 *     LEAD_FROM_EMAIL remitente; si no se define, usa SMTP_USER.
 *                     Con Gmail SMTP el remitente debe ser la propia cuenta
 *                     (o un alias "send as" verificado), no un dominio ajeno.
 *
 * Degradacion honesta (decision sdd/captacion-ia/config): el modulo se
 * construye YA aunque las credenciales aun no esten conectadas. Si faltan
 * SMTP_USER / SMTP_PASS, o si el envio falla, NO lanza: devuelve un
 * resultado { delivered: false } con motivo, para que el endpoint y el
 * formulario muestren el fallback al email directo (nunca un callejon sin
 * salida).
 *
 * SERVER-ONLY: lee las variables sensibles con runtimeEnv (process.env en
 * runtime, no import.meta.env inlineado en build) e importa nodemailer (modulo
 * de Node). No debe importarse jamas desde codigo de cliente. Se usa solo
 * dentro de rutas SSR (prerender = false).
 */

import nodemailer from 'nodemailer'
import { runtimeEnv } from '../runtime-env'

/** Email directo de fallback, visible cuando el envio no esta disponible. */
export const FALLBACK_EMAIL = 'info@zanovix.com'

/** Host SMTP por defecto: Gmail / Google Workspace. */
const DEFAULT_SMTP_HOST = 'smtp.gmail.com'

/** Puerto SMTP por defecto: 465 (SSL implicito). */
const DEFAULT_SMTP_PORT = 465

/** Datos minimos de un lead listos para componer el email. */
export interface LeadPayload {
  name: string
  email: string
  /** Empresa o mensaje libre del visitante. */
  message: string
  /** Canal por el que llego el lead (p.ej. 'asistente-embudo', 'contacto'). */
  origin?: string
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
    ...(lead.origin ? [`Procedencia: ${lead.origin}`] : []),
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
    lead.origin ? row('Procedencia', lead.origin) : '',
    '<h2 style="font-size:1rem;margin:1.5rem 0 0.75rem">Mensaje</h2>',
    `<p style="margin:0;white-space:pre-wrap">${escapeHtml(lead.message || '(sin mensaje)')}</p>`,
    contextBlock,
    '</div>',
  ].join('')
}

/**
 * Envia el lead por email via SMTP (Google Workspace). Nunca lanza:
 * devuelve siempre un SendResult.
 *
 * Comportamiento sin credenciales (caso actual): devuelve delivered=false
 * con reason='not-configured' para que el formulario muestre el fallback
 * honesto. Un fallo del servidor SMTP devuelve reason='provider-error';
 * un fallo de conexion/timeout, reason='network-error'.
 */
export async function sendLead(lead: LeadPayload): Promise<SendResult> {
  // Leidas en RUNTIME (process.env primero) para funcionar en produccion con
  // el entorno del servidor sin rebuild; ver runtime-env.ts.
  const host = runtimeEnv('SMTP_HOST') || DEFAULT_SMTP_HOST
  const port = Number(runtimeEnv('SMTP_PORT')) || DEFAULT_SMTP_PORT
  const user = runtimeEnv('SMTP_USER')
  const pass = runtimeEnv('SMTP_PASS')
  const to = runtimeEnv('LEAD_TO_EMAIL') || FALLBACK_EMAIL
  // Con Gmail SMTP el remitente debe ser la propia cuenta autenticada (o un
  // alias "send as" verificado). Por defecto, el propio SMTP_USER.
  const from = runtimeEnv('LEAD_FROM_EMAIL') || user

  if (!user || !pass) {
    return { delivered: false, reason: 'not-configured', fallbackEmail: to }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      // 465 => SSL implicito (secure). 587/otros => STARTTLS.
      secure: port === 465,
      auth: { user, pass },
    })

    await transporter.sendMail({
      from,
      to,
      replyTo: lead.email,
      subject: buildSubject(lead),
      text: buildText(lead),
      html: buildHtml(lead),
    })

    return { delivered: true, fallbackEmail: to }
  } catch (err) {
    // Nodemailer agrupa fallos de autenticacion/respuesta del servidor bajo
    // codigos como EAUTH/EENVELOPE/EMESSAGE; los de socket/DNS bajo
    // ECONNECTION/ETIMEDOUT/EDNS. Distinguimos solo para el motivo honesto.
    const code = (err as { code?: string } | undefined)?.code ?? ''
    const networkCodes = ['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS', 'ECONNREFUSED']
    const reason = networkCodes.includes(code) ? 'network-error' : 'provider-error'
    return { delivered: false, reason, fallbackEmail: to }
  }
}
