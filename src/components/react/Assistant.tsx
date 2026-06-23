/**
 * Assistant.tsx — asistente global discreto y transparente (isla React)
 *
 * Un acompañante de TODA la web, no un chatbot de plantilla. Un LANZADOR
 * pequeño y sobrio (esquina) que abre un PANEL calmado en el sistema visual de
 * Zanovix (mundo brand, no chat generico). NUNCA se abre solo: solo tras una
 * accion explicita del visitante. Opt-in, honesto, util y GROUNDED.
 *
 * TRANSPARENCIA: al abrir, una nota clara dice que es una IA (no una persona) y
 * que lo que escribas se procesa con un proveedor externo (OpenRouter). Sin
 * checkbox bloqueante por mensaje, pero la nota se ve.
 *
 * CHAT: postea a /api/assistant (POST, streaming text/plain). Pinta la
 * respuesta token a token; si no hay stream, la muestra entera igual. El
 * servidor lleva el system prompt grounded, los limites y la degradacion.
 *
 * DEGRADACION: si no hay clave/error/timeout, el endpoint responde con un
 * mensaje honesto y la cabecera X-Assistant-Degraded; aqui mostramos ademas un
 * CTA al contacto. Nunca se rompe.
 *
 * HANDOFF [[ABRIR_CONTACTO]]: cuando el modelo decide ofrecer hablar con una
 * persona, termina con la marca [[ABRIR_CONTACTO]]. La detectamos, la quitamos
 * del texto visible y mostramos un boton que dispara el evento global
 * `zx:open-contact` con el contexto de la conversacion (resumen), para abrir
 * el ContactDialog.
 *
 * LEAD CAPTURE [[RECOGER_LEAD]]: cuando el modelo decide recoger el lead
 * in-chat, emite [[RECOGER_LEAD]]. Se muestra un mini-form (nombre + email +
 * consentimiento RGPD) que postea a /api/lead con el contexto autorrelleno.
 * Si degraded=true, no se muestra el form: se hace handoff al ContactDialog.
 *
 * A11y: panel como dialogo (role + aria-labelledby), foco gestionado al abrir y
 * al cerrar (vuelve al lanzador), Esc cierra, foco atrapado dentro del panel,
 * aria-live en las respuestas, teclado completo. reduced-motion: sin
 * transiciones (CSS).
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ASSISTANT_INPUT_MAX } from '../../lib/assistant/assistant'
import { OPEN_CONTACT_EVENT, OPEN_ASSISTANT_EVENT } from './ContactDialog'
import type { ContactDialogContext } from './ContactDialog'

type Role = 'user' | 'assistant'

interface Turn {
  role: Role
  content: string
  /** El asistente ofrecio abrir el formulario en este turno. */
  offerContact?: boolean
  /** El asistente solicita recoger el lead in-chat en este turno. */
  collectLead?: boolean
  /** El turno termino en degradacion (sin IA en vivo). */
  degraded?: boolean
}

/** Marca que el modelo añade para ofrecer el handoff al formulario. */
const OPEN_CONTACT_TOKEN = '[[ABRIR_CONTACTO]]'

/** Marca que el modelo añade para solicitar la recogida de lead in-chat. */
const COLLECT_LEAD_TOKEN = '[[RECOGER_LEAD]]'

// ─── LeadCaptureForm ─────────────────────────────────────────────────────────
// Mini-form in-chat (nombre + email + consentimiento RGPD + honeypot).
// Se renderiza como respuesta a [[RECOGER_LEAD]] dentro del log del asistente.
// El message/context se autorrellena desde buildHandoffMessage(turns): el
// visitante no escribe nada. POST /api/lead con origin: 'asistente-embudo'.

type LeadStatus = 'idle' | 'sending' | 'success' | 'error'

interface LeadFieldErrors {
  name?: string
  email?: string
  consent?: string
}

interface LeadApiResponse {
  ok: boolean
  delivered: boolean
  fallbackEmail: string
  errors?: LeadFieldErrors & { message?: string }
  error?: string
}

const FALLBACK_EMAIL = 'info@zanovix.com'

interface LeadCaptureFormProps {
  turns: Turn[]
}

function LeadCaptureForm({ turns }: LeadCaptureFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const [status, setStatus] = useState<LeadStatus>('idle')
  const [errors, setErrors] = useState<LeadFieldErrors>({})
  const [globalMsg, setGlobalMsg] = useState<string | null>(null)
  const [fallback, setFallback] = useState(FALLBACK_EMAIL)
  const [degraded, setDegraded] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // Focus management: auto-focus name on mount.
  useEffect(() => {
    requestAnimationFrame(() => nameRef.current?.focus())
  }, [])

  // Focus result div on success so screen readers announce it.
  useEffect(() => {
    if (status === 'success' && resultRef.current) resultRef.current.focus()
  }, [status])

  function focusFirstError(e: LeadFieldErrors) {
    if (e.name) nameRef.current?.focus()
    else if (e.email) emailRef.current?.focus()
    else if (e.consent) consentRef.current?.focus()
  }

  function clientValidate(): LeadFieldErrors {
    const e: LeadFieldErrors = {}
    if (name.trim().length < 2) e.name = 'Dime tu nombre para saber con quien hablo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Necesito un email valido para poder responderte.'
    if (!consent) e.consent = 'Necesito tu consentimiento para poder responderte.'
    return e
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (status === 'sending') return

    const clientErrors = clientValidate()
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      focusFirstError(clientErrors)
      return
    }

    setErrors({})
    setGlobalMsg(null)
    setStatus('sending')

    const message = buildHandoffMessage(turns)

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message || 'Lead recogido desde el asistente.',
          consent,
          company_url: honeypot,
          context: {
            raw: message || undefined,
          },
          origin: 'asistente-embudo',
        }),
      })

      const data = (await res.json()) as LeadApiResponse
      setFallback(data.fallbackEmail || FALLBACK_EMAIL)

      if (res.status === 429) {
        setStatus('error')
        setGlobalMsg(data.error ?? 'Has enviado varios mensajes seguidos. Espera un momento.')
        return
      }

      if (!data.ok) {
        if (data.errors) {
          const fieldErrors: LeadFieldErrors = {
            name: data.errors.name,
            email: data.errors.email,
            consent: data.errors.consent,
          }
          setErrors(fieldErrors)
          focusFirstError(fieldErrors)
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

  const describeField = (field: keyof LeadFieldErrors) =>
    errors[field] ? `lcf-${field}-error` : undefined

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div
        className="lcf__result"
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
      >
        <p className="lcf__result-title">Recibido. Gracias.</p>
        {degraded ? (
          <p className="lcf__result-body">
            He guardado tu mensaje, pero el envio automatico aun no esta del todo
            conectado. Para asegurar que llega, escribenos tambien a{' '}
            <a className="lcf__mail" href={`mailto:${fallback}`}>
              {fallback}
            </a>
            . Respondemos en menos de 24h habiles.
          </p>
        ) : (
          <p className="lcf__result-body">
            Te respondemos en menos de 24h habiles. Si prefieres, tambien puedes
            escribirnos a{' '}
            <a className="lcf__mail" href={`mailto:${fallback}`}>
              {fallback}
            </a>
            .
          </p>
        )}
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form className="lcf" onSubmit={handleSubmit} noValidate aria-label="Reservar diagnostico">
      {/* Global error message (rate limit, network). */}
      <div aria-live="assertive" className="lcf__global">
        {globalMsg && <p className="lcf__global-msg">{globalMsg}</p>}
      </div>

      {/* Honeypot: hidden from humans, bots fill it. */}
      <div className="lcf__hp" aria-hidden="true">
        <label htmlFor="lcf-company_url">No rellenes este campo</label>
        <input
          id="lcf-company_url"
          name="company_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="lcf__field">
        <label className="lcf__label" htmlFor="lcf-name">
          Tu nombre
        </label>
        <input
          id="lcf-name"
          name="name"
          ref={nameRef}
          className="lcf__input"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describeField('name')}
          required
        />
        {errors.name && (
          <p id="lcf-name-error" className="lcf__error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="lcf__field">
        <label className="lcf__label" htmlFor="lcf-email">
          Tu email
        </label>
        <input
          id="lcf-email"
          name="email"
          ref={emailRef}
          className="lcf__input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describeField('email')}
          required
        />
        {errors.email && (
          <p id="lcf-email-error" className="lcf__error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="lcf__consent">
        <input
          id="lcf-consent"
          name="consent"
          ref={consentRef}
          className="lcf__check"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? 'lcf-consent-error' : undefined}
          required
        />
        <label className="lcf__consent-label" htmlFor="lcf-consent">
          Acepto que uses estos datos para responderme. Nada mas. Lee como los
          tratamos en{' '}
          <a className="lcf__inline-link" href="/privacidad" target="_blank" rel="noopener">
            privacidad
          </a>
          .
        </label>
      </div>
      {errors.consent && (
        <p id="lcf-consent-error" className="lcf__error" role="alert">
          {errors.consent}
        </p>
      )}

      <button className="lcf__submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando...' : 'Reservar diagnostico'}
      </button>

      <p className="lcf__fallback-note">
        O escribenos a{' '}
        <a className="lcf__inline-link" href={`mailto:${fallback}`}>
          {fallback}
        </a>
        .
      </p>
    </form>
  )
}

const INTRO: Turn = {
  role: 'assistant',
  content:
    'Hola. Soy el asistente de Zanovix. Puedo orientarte por encima y gratis sobre si la IA te aporta de verdad y por donde empezarias, sin venderte humo. No es el diagnostico a fondo, es una primera lectura. Para empezar, ¿a que se dedica tu negocio?',
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return (
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Compone un resumen breve de la conversacion para el handoff al formulario.
 * Va al campo de mensaje (editable) del ContactDialog: transparencia, no caja
 * negra. Tomamos los ultimos turnos del visitante.
 */
function buildHandoffMessage(turns: Turn[]): string {
  const userLines = turns
    .filter((t) => t.role === 'user')
    .map((t) => t.content.trim())
    .filter(Boolean)
  if (userLines.length === 0) return ''
  const recent = userLines.slice(-3)
  return ['Vengo del asistente de la web. Esto es lo que le he contado:', ...recent.map((l) => `- ${l}`)].join(
    '\n',
  )
}

export default function Assistant() {
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([INTRO])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const launcherRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const noteId = useId()

  // ─── Apertura / cierre (siempre por accion explicita; nunca solo) ─────────
  const openPanel = useCallback(() => setOpen(true), [])

  const closePanel = useCallback(() => {
    setOpen(false)
    // Devolver el foco al lanzador al cerrar.
    requestAnimationFrame(() => launcherRef.current?.focus())
  }, [])

  // Listen for the global zx:open-assistant event dispatched by generic site
  // CTAs via the delegated script in PageLayout. Opens the panel and focuses
  // the input (same a11y behaviour as the launcher click).
  useEffect(() => {
    function onOpenAssistant() {
      openPanel()
    }
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpenAssistant)
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpenAssistant)
  }, [openPanel])

  // Al abrir, foco al campo de escritura.
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  // Esc cierra; Tab atrapa el foco dentro del panel (focus trap manual: el
  // panel no es <dialog> porque debe coexistir como capa persistente discreta).
  useEffect(() => {
    if (!open) return
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closePanel()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeydown, true)
    return () => document.removeEventListener('keydown', onKeydown, true)
  }, [open, closePanel])

  // Auto-scroll del registro al ultimo mensaje (sin animar si reduced-motion).
  useEffect(() => {
    const log = logRef.current
    if (!log) return
    log.scrollTo({
      top: log.scrollHeight,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [turns])

  // ─── Handoff al formulario de contacto ────────────────────────────────────
  function handoff() {
    const detail: ContactDialogContext = {
      origin: 'asistente',
      message: buildHandoffMessage(turns),
    }
    window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT, { detail }))
    closePanel()
  }

  // ─── Envio de un mensaje ──────────────────────────────────────────────────
  async function send(text: string) {
    const clean = text.trim()
    if (!clean || sending) return

    // Historial para el servidor: lo previo (sin la intro de bienvenida).
    const priorHistory = turns
      .filter((t, i) => !(i === 0 && t.role === 'assistant')) // descarta INTRO
      .map((t) => ({ role: t.role, content: t.content }))

    setTurns((prev) => [...prev, { role: 'user', content: clean }])
    setInput('')
    setSending(true)

    // Indice del turno del asistente que vamos a rellenar en streaming.
    let assistantIndex = -1
    setTurns((prev) => {
      assistantIndex = prev.length
      return [...prev, { role: 'assistant', content: '' }]
    })

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean, history: priorHistory }),
      })

      const isDegraded = res.headers.get('x-assistant-degraded') === '1'

      // Streaming token a token si hay body legible; si no, texto entero.
      let acc = ''
      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          acc += decoder.decode(value, { stream: true })
          // Strip both tokens from visible text during streaming.
          const visible = acc
            .replace(OPEN_CONTACT_TOKEN, '')
            .replace(COLLECT_LEAD_TOKEN, '')
            .trimEnd()
          setTurns((prev) => {
            const next = [...prev]
            if (next[assistantIndex]) {
              next[assistantIndex] = { ...next[assistantIndex]!, content: visible }
            }
            return next
          })
        }
      } else {
        acc = await res.text()
      }

      const offerContact = acc.includes(OPEN_CONTACT_TOKEN)
      // collectLead is only shown when not degraded (degraded falls back to contact form).
      const collectLead = acc.includes(COLLECT_LEAD_TOKEN) && !isDegraded
      const finalText = acc
        .replace(OPEN_CONTACT_TOKEN, '')
        .replace(COLLECT_LEAD_TOKEN, '')
        .trim()
      setTurns((prev) => {
        const next = [...prev]
        if (next[assistantIndex]) {
          next[assistantIndex] = {
            role: 'assistant',
            content:
              finalText ||
              'No he podido responderte ahora mismo. Escribenos y te contesta una persona.',
            offerContact: offerContact && !isDegraded,
            collectLead,
            degraded: isDegraded,
          }
        }
        return next
      })
    } catch {
      setTurns((prev) => {
        const next = [...prev]
        if (next[assistantIndex]) {
          next[assistantIndex] = {
            role: 'assistant',
            content:
              'No he podido conectar ahora mismo. Si quieres, escribenos y te responde una persona del equipo.',
            degraded: true,
          }
        }
        return next
      })
    } finally {
      setSending(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void send(input)
  }

  // Enter envia, Shift+Enter salto de linea.
  function onInputKeydown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send(input)
    }
  }

  return (
    <>
      {/* ── Lanzador discreto (todas las paginas; no se abre solo) ────────── */}
      <button
        ref={launcherRef}
        type="button"
        className="assistant-launcher"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        onClick={openPanel}
        hidden={open}
      >
        <span className="assistant-launcher__dot" aria-hidden="true" />
        <span className="assistant-launcher__label">Asistente</span>
      </button>

      {/* ── Panel calmado (mundo brand, no chat generico) ────────────────── */}
      {open && (
        <div
          className="assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          aria-describedby={noteId}
          ref={panelRef}
        >
          <div className="assistant-panel__head">
            <p className="assistant-panel__title" id={titleId}>
              <span className="assistant-panel__dot" aria-hidden="true" />
              Asistente Zanovix
            </p>
            <button
              type="button"
              className="assistant-panel__close"
              aria-label="Cerrar el asistente"
              onClick={closePanel}
            >
              <span className="assistant-panel__close-bar" aria-hidden="true" />
              <span className="assistant-panel__close-bar" aria-hidden="true" />
            </button>
          </div>

          <p className="assistant-panel__note" id={noteId}>
            Soy una IA, no una persona. Lo que escribas se procesa con un proveedor
            externo (OpenRouter) para poder responderte.{' '}
            <a className="assistant-panel__note-link" href="/privacidad">
              Como funciona
            </a>
            .
          </p>

          <div
            className="assistant-panel__log"
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Conversacion con el asistente"
          >
            {turns.map((t, i) => (
              <div
                key={i}
                className={`assistant-msg assistant-msg--${t.role}${
                  t.degraded ? ' assistant-msg--degraded' : ''
                }`}
              >
                <p className="assistant-msg__body">
                  {t.content || (t.role === 'assistant' && sending ? '…' : '')}
                </p>
                {/* Direct exit to the form: shown on the first assistant message
                    so visitors who already decided can skip the conversation. */}
                {i === 0 && t.role === 'assistant' && (
                  <button
                    type="button"
                    className="assistant-msg__skip-to-form"
                    onClick={handoff}
                  >
                    Prefiero ir al formulario
                  </button>
                )}
                {t.offerContact && (
                  <button
                    type="button"
                    className="assistant-msg__handoff"
                    onClick={handoff}
                  >
                    Hablar con una persona
                  </button>
                )}
                {t.collectLead && (
                  <LeadCaptureForm turns={turns} />
                )}
                {t.degraded && (
                  <button
                    type="button"
                    className="assistant-msg__handoff"
                    onClick={handoff}
                  >
                    Escribir al equipo
                  </button>
                )}
              </div>
            ))}
          </div>

          <form className="assistant-panel__form" onSubmit={onSubmit}>
            <label htmlFor="assistant-input" className="sr-only">
              Escribe tu mensaje para el asistente
            </label>
            <textarea
              id="assistant-input"
              ref={inputRef}
              className="assistant-panel__input"
              rows={1}
              maxLength={ASSISTANT_INPUT_MAX}
              placeholder="Escribe aqui. Ej: ¿que haceis?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKeydown}
              disabled={sending}
            />
            <button
              type="submit"
              className="assistant-panel__submit"
              disabled={sending || !input.trim()}
              aria-label="Enviar mensaje"
            >
              {sending ? '…' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
