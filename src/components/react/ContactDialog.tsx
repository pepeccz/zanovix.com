/**
 * ContactDialog.tsx — captacion como dialogo en contexto (isla React global)
 *
 * La captacion deja de ser un salto de pagina: el formulario vive dentro de un
 * <dialog> nativo que se abre EN CONTEXTO al pulsar un CTA, sin perder la
 * pagina donde esta el visitante. NUNCA se abre solo (no es un popup): solo
 * responde a una accion explicita (click en un CTA o el cierre de una
 * conversacion del asistente).
 *
 * Se monta UNA vez en PageLayout.astro (client:idle) para estar disponible en
 * todas las paginas.
 *
 * APERTURA (Astro <-> React, desacoplado por eventos):
 *   - Un script delegado en PageLayout escucha clicks en [data-open-contact].
 *   - Si hay JS: preventDefault + dispatch de un CustomEvent global
 *     `zx:open-contact` en window, con detail = contexto conocido
 *     (nombre/sector/zona/resultado GEO/origen).
 *   - Este componente escucha ese evento, prellena y abre showModal().
 *   - SIN JS: el CTA es un <a href="/contacto"> normal y lleva a la pagina de
 *     respaldo. Degradacion honesta.
 *
 * <dialog> nativo nos da gratis: focus trap, cierre con Esc, backdrop e inert
 * del fondo. Al abrir, foco al primer campo; al cerrar, foco de vuelta al
 * disparador (lo guardamos del evento). aria-labelledby al titulo.
 *
 * PREFILL: contexto del evento + lo que haya en sessionStorage (companion). El
 * evento gana sobre el storage campo a campo. El nombre del negocio y el
 * veredicto GEO viajan como texto editable dentro del mensaje/contexto.
 *
 * A11y: labels asociadas, errores por campo (aria-describedby + aria-invalid),
 * aria-live en resultado y errores globales, foco gestionado, teclado
 * completo. Reduced-motion: el dialogo aparece sin transicion (CSS).
 *
 * Envio: postea a /api/lead (mismo contrato que LeadForm). Estados
 * idle/sending/success/error con fallback honesto al email directo.
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { readContext } from '../../lib/companion/context'

type Status = 'idle' | 'sending' | 'success' | 'error'

interface FieldErrors {
  name?: string
  email?: string
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

/**
 * Contexto que un CTA puede pasar al abrir el dialogo. Todo opcional: un CTA
 * generico abre el dialogo vacio; el simulador GEO lo abre con nombre/sector/
 * zona y el veredicto de la radiografia.
 */
export interface ContactDialogContext {
  /** Nombre del negocio (p.ej. del simulador GEO). */
  name?: string
  sector?: string
  zone?: string
  /** Veredicto/lectura de la radiografia GEO, ya en lenguaje natural. */
  geoVerdict?: string
  /** Etiqueta de donde se abrio (para el correo). */
  origin?: string
  /** Mensaje inicial sugerido (si el CTA quiere precargar el textarea). */
  message?: string
}

/** Nombre del evento global que abre el dialogo. */
export const OPEN_CONTACT_EVENT = 'zx:open-contact'

const FALLBACK_EMAIL = 'info@zanovix.com'

/**
 * Compone el texto inicial del mensaje a partir del contexto del CTA. El
 * visitante lo ve y lo puede editar: transparencia, no caja negra.
 */
function buildInitialMessage(ctx: ContactDialogContext): string {
  const lines: string[] = []
  if (ctx.name) lines.push(`Mi negocio se llama ${ctx.name}.`)
  if (ctx.geoVerdict) lines.push(`Radiografia GEO: ${ctx.geoVerdict}`)
  if (ctx.message) lines.push(ctx.message)
  return lines.join('\n')
}

export default function ContactDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  // El elemento que disparo la apertura, para devolverle el foco al cerrar.
  const triggerRef = useRef<HTMLElement | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  // Sector/zona/origen conocidos del contexto; viajan al correo, no como
  // campos visibles obligatorios (el mensaje editable ya los recoge).
  const [meta, setMeta] = useState<ContactDialogContext>({})

  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [globalMsg, setGlobalMsg] = useState<string | null>(null)
  const [fallback, setFallback] = useState(FALLBACK_EMAIL)
  const [degraded, setDegraded] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // ─── Apertura por evento global ─────────────────────────────────────────
  useEffect(() => {
    function onOpen(ev: Event) {
      const detail = (ev as CustomEvent<ContactDialogContext>).detail ?? {}

      // Recordar quien disparo, para devolver el foco al cerrar.
      const t = (ev as CustomEvent<ContactDialogContext & { trigger?: HTMLElement }>).detail as
        | (ContactDialogContext & { trigger?: HTMLElement })
        | undefined
      triggerRef.current =
        t?.trigger ?? (document.activeElement as HTMLElement | null) ?? null

      // Prefill: sessionStorage primero, el evento gana campo a campo.
      const saved = readContext()
      const savedSector = saved?.sector?.trim()
      const merged: ContactDialogContext = {
        name: detail.name,
        sector: detail.sector ?? (savedSector || undefined),
        zone: detail.zone,
        geoVerdict: detail.geoVerdict,
        origin: detail.origin,
        message: detail.message,
      }
      setMeta(merged)

      // Reset de estado por si se reabre tras un envio.
      setStatus('idle')
      setErrors({})
      setGlobalMsg(null)
      setDegraded(false)

      // Mensaje inicial: contexto del CTA + texto libre del companion si lo hay.
      const initial = buildInitialMessage(merged) || saved?.raw || ''
      setMessage(initial)

      const dlg = dialogRef.current
      if (dlg && !dlg.open) {
        dlg.showModal()
        // Foco al primer campo tras pintar.
        requestAnimationFrame(() => nameRef.current?.focus())
      }
    }

    window.addEventListener(OPEN_CONTACT_EVENT, onOpen as EventListener)
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, onOpen as EventListener)
  }, [])

  // Al cerrar el <dialog> (Esc, backdrop, boton), devolver el foco al disparador.
  const handleClose = useCallback(() => {
    const t = triggerRef.current
    if (t && typeof t.focus === 'function') {
      requestAnimationFrame(() => t.focus())
    }
  }, [])

  function requestClose() {
    dialogRef.current?.close()
  }

  // Cierre por click en el backdrop (fuera del panel).
  function onDialogClick(ev: React.MouseEvent<HTMLDialogElement>) {
    if (ev.target === dialogRef.current) requestClose()
  }

  function focusFirstError(e: FieldErrors) {
    if (e.name) nameRef.current?.focus()
    else if (e.email) emailRef.current?.focus()
    else if (e.message) messageRef.current?.focus()
    else if (e.consent) consentRef.current?.focus()
  }

  useEffect(() => {
    if (status === 'success' && resultRef.current) resultRef.current.focus()
  }, [status])

  function clientValidate(): FieldErrors {
    const e: FieldErrors = {}
    if (name.trim().length < 2) e.name = 'Dime tu nombre para saber con quien hablo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Necesito un email valido para poder responderte.'
    if (message.trim().length < 5) e.message = 'Cuentanos algo de tu caso, aunque sea una linea.'
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

    // Contexto para el correo: sector/zona/origen + veredicto GEO como "raw".
    const rawParts: string[] = []
    if (meta.zone) rawParts.push(`Zona: ${meta.zone}`)
    if (meta.geoVerdict) rawParts.push(`Radiografia GEO: ${meta.geoVerdict}`)
    if (meta.origin) rawParts.push(`Origen: ${meta.origin}`)

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          consent,
          company_url: honeypot,
          context: {
            sector: meta.sector || undefined,
            raw: rawParts.length ? rawParts.join(' · ') : undefined,
          },
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

      setDegraded(!data.delivered)
      setStatus('success')
    } catch {
      setStatus('error')
      setDegraded(true)
      setGlobalMsg(
        'No he podido enviar el formulario ahora mismo. Escribenos directamente y te respondemos.',
      )
    }
  }

  const describe = (field: keyof FieldErrors) =>
    errors[field] ? `cd-${field}-error` : undefined

  return (
    <dialog
      ref={dialogRef}
      className="cdialog"
      aria-labelledby={titleId}
      onClose={handleClose}
      onClick={onDialogClick}
    >
      <div className="cdialog__panel">
        <button
          type="button"
          className="cdialog__close"
          aria-label="Cerrar"
          onClick={requestClose}
        >
          <span className="cdialog__close-bar" aria-hidden="true" />
          <span className="cdialog__close-bar" aria-hidden="true" />
        </button>

        {status === 'success' ? (
          <div className="cdialog__result" ref={resultRef} tabIndex={-1} aria-live="polite">
            <p className="cdialog__result-title">Recibido. Gracias.</p>
            {degraded ? (
              <p className="cdialog__result-body">
                He guardado tu mensaje, pero el envio automatico aun no esta del todo
                conectado. Para asegurar que llega, escribenos tambien a{' '}
                <a className="cdialog__mail" href={`mailto:${fallback}`}>
                  {fallback}
                </a>
                . Respondemos en menos de 24h habiles.
              </p>
            ) : (
              <p className="cdialog__result-body">
                Te respondemos en menos de 24h habiles. Si prefieres, tambien puedes
                escribirnos a{' '}
                <a className="cdialog__mail" href={`mailto:${fallback}`}>
                  {fallback}
                </a>
                .
              </p>
            )}
            <button type="button" className="cdialog__done" onClick={requestClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <p className="cdialog__eyebrow">// conversación</p>
            <h2 id={titleId} className="cdialog__title">
              Cuéntanos tu caso.
            </h2>
            <p className="cdialog__lede">
              {meta.name
                ? `Hablamos de ${meta.name}. Si te conviene, lo ajustas antes de enviar.`
                : 'En un minuto. Respondemos en menos de 24h hábiles, una persona de verdad.'}
            </p>

            <form className="cdialog__form" onSubmit={handleSubmit} noValidate>
              <div aria-live="assertive" className="cdialog__global">
                {status === 'error' && globalMsg && (
                  <p className="cdialog__global-msg">{globalMsg}</p>
                )}
              </div>

              {/* Honeypot anti-bot. */}
              <div className="cdialog__hp" aria-hidden="true">
                <label htmlFor="cd-company_url">No rellenes este campo</label>
                <input
                  id="cd-company_url"
                  name="company_url"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="cdialog__field">
                <label className="cdialog__label" htmlFor="cd-name">
                  Tu nombre
                </label>
                <input
                  id="cd-name"
                  name="name"
                  ref={nameRef}
                  className="cdialog__input"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={describe('name')}
                  required
                />
                {errors.name && (
                  <p id="cd-name-error" className="cdialog__error">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="cdialog__field">
                <label className="cdialog__label" htmlFor="cd-email">
                  Tu email
                </label>
                <input
                  id="cd-email"
                  name="email"
                  ref={emailRef}
                  className="cdialog__input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={describe('email')}
                  required
                />
                {errors.email && (
                  <p id="cd-email-error" className="cdialog__error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="cdialog__field">
                <label className="cdialog__label" htmlFor="cd-message">
                  Tu empresa y qué te trae aquí
                </label>
                <textarea
                  id="cd-message"
                  name="message"
                  ref={messageRef}
                  className="cdialog__textarea"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={describe('message')}
                  required
                />
                {errors.message && (
                  <p id="cd-message-error" className="cdialog__error">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="cdialog__consent">
                <input
                  id="cd-consent"
                  name="consent"
                  ref={consentRef}
                  className="cdialog__check"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? 'cd-consent-error' : undefined}
                  required
                />
                <label className="cdialog__consent-label" htmlFor="cd-consent">
                  Acepto que uses estos datos para responderme. Nada más. Lee cómo los
                  tratamos en{' '}
                  <a className="cdialog__inline-link" href="/privacidad">
                    privacidad
                  </a>
                  .
                </label>
              </div>
              {errors.consent && (
                <p id="cd-consent-error" className="cdialog__error">
                  {errors.consent}
                </p>
              )}

              <button
                className="cdialog__submit"
                type="submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
              </button>

              <p className="cdialog__fallback-note">
                Si lo prefieres, escríbenos directo a{' '}
                <a className="cdialog__inline-link" href={`mailto:${fallback}`}>
                  {fallback}
                </a>
                .
              </p>
            </form>
          </>
        )}
      </div>
    </dialog>
  )
}
