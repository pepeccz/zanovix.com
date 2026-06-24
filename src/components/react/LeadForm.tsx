/**
 * LeadForm.tsx — formulario de captacion de leads (isla React)
 *
 * Jubila el mailto como via principal: el visitante acaba aqui y el lead se
 * envia por email transaccional via /api/lead. El contexto que el Companion
 * ya infirio (sector / dolor / urgencia) se PRECARGA desde sessionStorage y
 * se muestra editable: transparencia, no caja negra. El visitante puede
 * corregirlo o vaciarlo antes de enviar.
 *
 * Degradacion honesta (sdd/captacion-ia/config: email build-now-connect-later):
 *   - Si el envio aun no esta configurado (sin clave Resend) o falla, el form
 *     no se queda en un callejon sin salida: muestra un fallback claro con el
 *     email directo (mailto) como via alternativa. La respuesta del endpoint
 *     distingue ok/delivered para decir la verdad ("recibido" vs "escribenos").
 *
 * Progressive enhancement / sin JS:
 *   - El <form> tiene action="/api/lead" method="post". Sin JS, postea directo
 *     al endpoint (el endpoint acepta form-urlencoded). Con JS, interceptamos
 *     y enviamos por fetch para dar estados accesibles sin recargar.
 *
 * A11y: labels asociadas, errores por campo con aria-describedby +
 * aria-invalid, aria-live en el resultado, foco gestionado al primer error o
 * al mensaje de exito, teclado completo. Reduced-motion respetado (sin
 * animaciones bloqueantes; las transiciones son CSS opcionales).
 */

import { useEffect, useRef, useState } from 'react'
import { readContext } from '../../lib/companion/context'
import type { CompanionContext } from '../../lib/companion/context'

type Status = 'idle' | 'sending' | 'success' | 'error'

interface FieldErrors {
  name?: string
  email?: string
  phone?: string
  message?: string
  consent?: string
}

interface LeadResponse {
  ok: boolean
  delivered: boolean
  fallbackEmail: string
  errors?: FieldErrors
  error?: string
}

const FALLBACK_EMAIL = 'info@zanovix.com'

export default function LeadForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  // Contexto del Companion, precargado y editable.
  const [ctx, setCtx] = useState<CompanionContext | null>(null)

  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  // Mensaje global del estado error (rate limit, fallo de red, fallback).
  const [globalMsg, setGlobalMsg] = useState<string | null>(null)
  // Email a ofrecer como via alternativa cuando el envio no se entrego.
  const [fallback, setFallback] = useState(FALLBACK_EMAIL)
  // delivered=false con ok=true: recibido pero no entregado por email aun.
  const [degraded, setDegraded] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // Precarga del contexto del Companion al montar.
  useEffect(() => {
    const saved = readContext()
    if (saved) {
      setCtx(saved)
      if (saved.raw && !message) setMessage(saved.raw)
    }
    // Se ejecuta una sola vez al montar; no dependemos de message a proposito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Foco al primer error tras una validacion fallida.
  function focusFirstError(e: FieldErrors) {
    if (e.name) nameRef.current?.focus()
    else if (e.email) emailRef.current?.focus()
    else if (e.phone) phoneRef.current?.focus()
    else if (e.message) messageRef.current?.focus()
    else if (e.consent) consentRef.current?.focus()
  }

  // Foco al resultado en exito (lectores de pantalla lo anuncian).
  useEffect(() => {
    if (status === 'success' && resultRef.current) resultRef.current.focus()
  }, [status])

  function clientValidate(): FieldErrors {
    const e: FieldErrors = {}
    if (name.trim().length < 2) e.name = 'Dime tu nombre para saber con quien hablo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Necesito un email valido para poder responderte.'
    if (!phone.trim()) {
      e.phone = 'Necesito un telefono para poder llamarte.'
    } else if (phone.replace(/[^\d]/g, '').length < 9) {
      e.phone = 'Pon un telefono valido, con al menos 9 cifras.'
    }
    if (message.trim().length < 5) e.message = 'Cuentame algo de tu caso, aunque sea una linea.'
    if (!consent) e.consent = 'Necesito tu consentimiento para poder responderte.'
    return e
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (status === 'sending') return

    const clientErrors = clientValidate()
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      setStatus('error')
      setGlobalMsg(null)
      focusFirstError(clientErrors)
      return
    }

    setErrors({})
    setGlobalMsg(null)
    setStatus('sending')

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          consent,
          company_url: honeypot,
          context: ctx ?? undefined,
        }),
      })

      const data = (await res.json()) as LeadResponse
      setFallback(data.fallbackEmail || FALLBACK_EMAIL)

      if (res.status === 429) {
        setStatus('error')
        setGlobalMsg(data.error ?? 'Has enviado varios mensajes seguidos. Espera un momento.')
        return
      }

      if (!data.ok) {
        if (data.errors) {
          setErrors(data.errors)
          focusFirstError(data.errors)
        }
        setStatus('error')
        setGlobalMsg(data.error ?? null)
        return
      }

      // ok=true. delivered distingue entrega real de degradacion honesta.
      setDegraded(!data.delivered)
      setStatus('success')
    } catch {
      // Fallo de red: nunca callejon sin salida, ofrecemos el email directo.
      setStatus('error')
      setDegraded(true)
      setGlobalMsg(
        'No he podido enviar el formulario ahora mismo. Escribenos directamente y te respondemos.',
      )
    }
  }

  // ─── Exito ──────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="leadform__result" ref={resultRef} tabIndex={-1} aria-live="polite">
        <p className="leadform__result-title">Recibido. Gracias.</p>
        {degraded ? (
          <p className="leadform__result-body">
            He guardado tu mensaje, pero el envio automatico aun no esta del todo conectado.
            Para asegurar que llega, escribenos tambien a{' '}
            <a className="leadform__mail" href={`mailto:${fallback}`}>
              {fallback}
            </a>
            . Respondemos en menos de 24h habiles.
          </p>
        ) : (
          <p className="leadform__result-body">
            Te respondemos en menos de 24h habiles. Si prefieres, tambien puedes escribirnos a{' '}
            <a className="leadform__mail" href={`mailto:${fallback}`}>
              {fallback}
            </a>
            .
          </p>
        )}
      </div>
    )
  }

  const describe = (field: keyof FieldErrors) => (errors[field] ? `${field}-error` : undefined)

  return (
    <form
      className="leadform"
      action="/api/lead"
      method="post"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Mensaje global de error (rate limit, red). aria-live para anunciarlo. */}
      <div aria-live="assertive" className="leadform__global">
        {status === 'error' && globalMsg && <p className="leadform__global-msg">{globalMsg}</p>}
      </div>

      {/* Honeypot: oculto para humanos, los bots lo rellenan. */}
      <div className="leadform__hp" aria-hidden="true">
        <label htmlFor="company_url">No rellenes este campo</label>
        <input
          id="company_url"
          name="company_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="leadform__field">
        <label className="leadform__label" htmlFor="lead-name">
          Tu nombre
        </label>
        <input
          id="lead-name"
          name="name"
          ref={nameRef}
          className="leadform__input"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describe('name')}
          required
        />
        {errors.name && (
          <p id="name-error" className="leadform__error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="leadform__field">
        <label className="leadform__label" htmlFor="lead-email">
          Tu email
        </label>
        <input
          id="lead-email"
          name="email"
          ref={emailRef}
          className="leadform__input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describe('email')}
          required
        />
        {errors.email && (
          <p id="email-error" className="leadform__error">
            {errors.email}
          </p>
        )}
      </div>

      <div className="leadform__field">
        <label className="leadform__label" htmlFor="lead-phone">
          Teléfono
        </label>
        <input
          id="lead-phone"
          name="phone"
          ref={phoneRef}
          className="leadform__input"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describe('phone')}
          required
        />
        {errors.phone && (
          <p id="phone-error" className="leadform__error">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="leadform__field">
        <label className="leadform__label" htmlFor="lead-message">
          Tu empresa y que te trae aqui
        </label>
        <textarea
          id="lead-message"
          name="message"
          ref={messageRef}
          className="leadform__textarea"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe('message')}
          required
        />
        {errors.message && (
          <p id="message-error" className="leadform__error">
            {errors.message}
          </p>
        )}
      </div>

      {/* Contexto del Companion: transparente y editable. Solo si existe. */}
      {ctx && (
        <fieldset className="leadform__context">
          <legend className="leadform__context-legend">
            Lo que entendio el asistente. Corrigelo si hace falta.
          </legend>

          <div className="leadform__field">
            <label className="leadform__label" htmlFor="lead-ctx-sector">
              Tu sector
            </label>
            <input
              id="lead-ctx-sector"
              name="ctx_sector"
              className="leadform__input"
              type="text"
              value={ctx.sector}
              onChange={(e) => setCtx((c) => (c ? { ...c, sector: e.target.value } : c))}
            />
          </div>

          <div className="leadform__field">
            <label className="leadform__label" htmlFor="lead-ctx-pain">
              Lo que mas te pesa
            </label>
            <input
              id="lead-ctx-pain"
              name="ctx_pain"
              className="leadform__input"
              type="text"
              value={ctx.pain}
              onChange={(e) => setCtx((c) => (c ? { ...c, pain: e.target.value } : c))}
            />
          </div>

          <div className="leadform__field">
            <label className="leadform__label" htmlFor="lead-ctx-urgency">
              Como lo vives
            </label>
            <input
              id="lead-ctx-urgency"
              name="ctx_urgency"
              className="leadform__input"
              type="text"
              value={ctx.urgency}
              onChange={(e) => setCtx((c) => (c ? { ...c, urgency: e.target.value } : c))}
            />
          </div>

          {/* El texto libre original viaja oculto para el correo. */}
          <input type="hidden" name="ctx_raw" value={ctx.raw ?? ''} />
        </fieldset>
      )}

      <div className="leadform__consent">
        <input
          id="lead-consent"
          name="consent"
          ref={consentRef}
          className="leadform__check"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? 'consent-error' : undefined}
          required
        />
        <label className="leadform__consent-label" htmlFor="lead-consent">
          Acepto que uses estos datos para responderme. Nada mas. Lee como los tratamos en{' '}
          <a className="leadform__inline-link" href="/privacidad">
            privacidad
          </a>
          .
        </label>
      </div>
      {errors.consent && (
        <p id="consent-error" className="leadform__error">
          {errors.consent}
        </p>
      )}

      <button className="leadform__submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
      </button>

      <p className="leadform__fallback-note">
        Si lo prefieres, escribenos directo a{' '}
        <a className="leadform__inline-link" href={`mailto:${fallback}`}>
          {fallback}
        </a>
        .
      </p>
    </form>
  )
}
