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
import { GEO_FIELD_MAX, GEO_NAME_MIN } from '../../lib/companion/geo'
import type { GeoSnapshot } from '../../lib/companion/geo'
import {
  READINESS_QUESTIONS,
  readReadiness,
} from '../../lib/readiness/readiness'
import type { ReadinessAnswers, ReadinessResult } from '../../lib/readiness/readiness'
import { SKETCH_INPUT_MIN, SKETCH_INPUT_MAX } from '../../lib/automation/sketch'
import type { AutomationSketch } from '../../lib/automation/sketch'
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
  /** El turno solicita ejecutar la radiografia GEO in-chat. */
  runGeo?: boolean
  /** El turno solicita ejecutar el autodiagnostico AI Readiness in-chat. */
  runReadiness?: boolean
  /** El turno solicita ejecutar el esbozo de automatizacion in-chat. */
  runSketch?: boolean
  /** El turno termino en degradacion (sin IA en vivo). */
  degraded?: boolean
  /** Tipo especial de turno (para renderizado alternativo). */
  kind?: 'geo-evidence' | 'readiness-evidence' | 'sketch-evidence'
  /** Snapshot GEO adjunto (solo cuando kind === 'geo-evidence'). */
  snapshot?: GeoSnapshot
  /** Resultado de AI Readiness adjunto (solo cuando kind === 'readiness-evidence'). */
  readiness?: ReadinessResult
  /** Resultado del esbozo de automatizacion adjunto (solo cuando kind === 'sketch-evidence'). */
  sketch?: AutomationSketch
}

/** Marca que el modelo añade para ofrecer el handoff al formulario. */
const OPEN_CONTACT_TOKEN = '[[ABRIR_CONTACTO]]'

/** Marca que el modelo añade para solicitar la recogida de lead in-chat. */
const COLLECT_LEAD_TOKEN = '[[RECOGER_LEAD]]'

/** Marca que el modelo añade para solicitar la radiografia GEO in-chat. */
const RUN_GEO_TOKEN = '[[RADIOGRAFIA_GEO]]'

/** Marca que el modelo añade para solicitar el autodiagnostico AI Readiness in-chat. */
const READINESS_TOKEN = '[[AI_READINESS]]'

/** Marca que el modelo añade para solicitar el esbozo de automatizacion in-chat. */
const SKETCH_TOKEN = '[[BOCETO_AUTOMATIZACION]]'

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

// ─── GeoInlineForm ───────────────────────────────────────────────────────────
// Compact GEO radiography widget rendered inline when the assistant emits
// [[RADIOGRAFIA_GEO]]. Runs once per widget instance; locks after a successful
// result. On success, calls onResult with the snapshot and framed context so
// the assistant can reinject and produce the verdict.

const GEO_KNOWN_LABEL: Record<GeoSnapshot['known'], string> = {
  yes: 'Una IA te reconoce',
  no: 'Una IA no te conoce todavia',
  unclear: 'Una IA conoce tu categoria, no tu negocio',
}

interface GeoInlineFormProps {
  onResult: (
    snapshot: GeoSnapshot | null,
    fallbackNotice: string | null,
    inputName: string,
    inputSector: string,
    inputZone: string,
  ) => void
}

function GeoInlineForm({ onResult }: GeoInlineFormProps) {
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [zone, setZone] = useState('')
  const [nameError, setNameError] = useState(false)
  const [posting, setPosting] = useState(false)
  const [locked, setLocked] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)

  // Auto-focus name on mount.
  useEffect(() => {
    requestAnimationFrame(() => nameRef.current?.focus())
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (posting || locked) return

    const cleanName = name.trim()
    if (cleanName.length < GEO_NAME_MIN) {
      setNameError(true)
      nameRef.current?.focus()
      return
    }
    setNameError(false)
    setPosting(true)

    try {
      const res = await fetch('/api/geo-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          sector: sector.trim() || undefined,
          zone: zone.trim() || undefined,
        }),
      })

      const data = (await res.json()) as {
        source?: 'live' | 'fallback'
        snapshot?: GeoSnapshot | null
        fallbackNotice?: string
      }

      setLocked(true)
      if (data.source === 'live' && data.snapshot) {
        onResult(data.snapshot, null, cleanName, sector.trim(), zone.trim())
      } else {
        onResult(null, data.fallbackNotice ?? null, cleanName, sector.trim(), zone.trim())
      }
    } catch {
      setPosting(false)
      // On network error keep the form unlocked so the user can retry.
    }
  }

  if (locked) {
    return (
      <div className="geo-inline__locked" aria-live="polite">
        <span className="geo-inline__dot" aria-hidden="true" />
        Radiografia en curso...
      </div>
    )
  }

  return (
    <form className="geo-inline" onSubmit={handleSubmit} noValidate aria-label="Radiografia GEO">
      <p className="geo-inline__eyebrow">Radiografia GEO</p>
      <p className="geo-inline__lede">
        Escribe el nombre real de tu negocio y le preguntamos en vivo a una IA que sabe de ti hoy.
      </p>

      <div className="geo-inline__field">
        <label className="geo-inline__label" htmlFor="geo-inline-name">
          Nombre del negocio <span className="geo-inline__req">(necesario)</span>
        </label>
        <input
          ref={nameRef}
          id="geo-inline-name"
          className="geo-inline__input"
          type="text"
          autoComplete="organization"
          maxLength={GEO_FIELD_MAX}
          placeholder="Ej: Bar Manolo"
          value={name}
          required
          aria-required="true"
          aria-invalid={nameError || undefined}
          aria-describedby={nameError ? 'geo-inline-name-error' : undefined}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) setNameError(false)
          }}
        />
        {nameError && (
          <p id="geo-inline-name-error" className="geo-inline__error" role="alert">
            Necesito el nombre real de tu negocio para preguntarle a la IA.
          </p>
        )}
      </div>

      <div className="geo-inline__pair">
        <div className="geo-inline__field">
          <label className="geo-inline__label" htmlFor="geo-inline-sector">
            Sector <span className="geo-inline__opt">(recomendado)</span>
          </label>
          <input
            id="geo-inline-sector"
            className="geo-inline__input"
            type="text"
            autoComplete="off"
            maxLength={GEO_FIELD_MAX}
            placeholder="Ej: restaurante"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          />
        </div>
        <div className="geo-inline__field">
          <label className="geo-inline__label" htmlFor="geo-inline-zone">
            Zona <span className="geo-inline__opt">(recomendado)</span>
          </label>
          <input
            id="geo-inline-zone"
            className="geo-inline__input"
            type="text"
            autoComplete="off"
            maxLength={GEO_FIELD_MAX}
            placeholder="Ej: Malaga centro"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          />
        </div>
      </div>

      <p className="geo-inline__note">
        Envia el nombre a un proveedor de IA (OpenRouter) para generar la radiografia.{' '}
        <a href="/privacidad" className="geo-inline__link">
          Como funciona
        </a>
        .
      </p>

      <button className="geo-inline__submit" type="submit" disabled={posting}>
        {posting ? 'Consultando...' : 'Ver radiografia'}
      </button>
    </form>
  )
}

// ─── GeoEvidenceCard ─────────────────────────────────────────────────────────
// Read-only display of a GeoSnapshot as a compact evidence card.

function GeoEvidenceCard({ snapshot }: { snapshot: GeoSnapshot }) {
  return (
    <div className="geo-card" aria-label="Resultado de la radiografia GEO">
      <span
        className={`geo-card__chip geo-card__chip--${snapshot.known}`}
        aria-label={`Visibilidad: ${GEO_KNOWN_LABEL[snapshot.known]}`}
      >
        {GEO_KNOWN_LABEL[snapshot.known]}
      </span>
      <dl className="geo-card__dl">
        <div className="geo-card__item">
          <dt>Que sabe de ti</dt>
          <dd>{snapshot.describes}</dd>
        </div>
        <div className="geo-card__item">
          <dt>Si te recomendaria</dt>
          <dd>{snapshot.recommend}</dd>
        </div>
        <div className="geo-card__item">
          <dt>Que le falta</dt>
          <dd>{snapshot.gap}</dd>
        </div>
      </dl>
      <p className="geo-card__note">
        Respuesta real del modelo. Refleja su conocimiento de entrenamiento, no una auditoria de tu web.
      </p>
    </div>
  )
}

// ─── ReadinessInlineForm ──────────────────────────────────────────────────────
// Compact AI Readiness questionnaire rendered inline when the assistant emits
// [[AI_READINESS]]. Renders all 6 READINESS_QUESTIONS as compact radio-groups.
// Requires all 6 answered; focuses first unanswered on incomplete submit.
// Computes readReadiness() locally (synchronous, no fetch). Locks after submit.

const READINESS_TONE_CHIP: Record<ReadinessResult['tone'], string> = {
  listo: 'Por aqui si',
  parcial: 'Con cabeza',
  cimientos: 'Primero los cimientos',
}

interface ReadinessInlineFormProps {
  onResult: (result: ReadinessResult) => void
}

function ReadinessInlineForm({ onResult }: ReadinessInlineFormProps) {
  const [answers, setAnswers] = useState<ReadinessAnswers>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Refs per question for focus management on validation error.
  const fieldsetRefs = useRef<(HTMLFieldSetElement | null)[]>([])

  function choose(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    if (submitError) setSubmitError(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (locked || submitting) return

    // Validate: all 6 questions must be answered.
    const keys = READINESS_QUESTIONS.map((q) => q.id)
    const firstUnanswered = keys.findIndex((k) => !answers[k])
    if (firstUnanswered !== -1) {
      setSubmitError('Responde todas las preguntas para obtener tu lectura.')
      // Focus the first unanswered fieldset for a11y.
      requestAnimationFrame(() => {
        const el = fieldsetRefs.current[firstUnanswered]
        el?.focus()
      })
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    // Synchronous: readReadiness does not call any API.
    const result = readReadiness(answers)
    setLocked(true)
    onResult(result)
  }

  if (locked) {
    return (
      <div className="readiness-inline__locked" aria-live="polite">
        <span className="readiness-inline__dot" aria-hidden="true" />
        Calculando tu lectura...
      </div>
    )
  }

  return (
    <form
      className="readiness-inline"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Autodiagnostico de AI Readiness"
    >
      <p className="readiness-inline__eyebrow">Autodiagnostico AI Readiness</p>
      <p className="readiness-inline__lede">
        Seis preguntas rapidas. Una lectura honesta: donde la IA te aporta hoy y donde no.
        Sin datos personales.
      </p>

      <div aria-live="assertive" className="readiness-inline__global-error-region">
        {submitError && (
          <p className="readiness-inline__global-error" role="alert">
            {submitError}
          </p>
        )}
      </div>

      {READINESS_QUESTIONS.map((q, i) => {
        const current = answers[q.id]
        return (
          <fieldset
            key={q.id}
            className="readiness-inline__fieldset"
            ref={(el) => { fieldsetRefs.current[i] = el }}
            tabIndex={-1}
          >
            <legend className="readiness-inline__legend">{q.legend}</legend>
            {q.hint && <p className="readiness-inline__hint">{q.hint}</p>}
            <div className="readiness-inline__options">
              {q.options.map((opt) => {
                const selected = current === opt.id
                return (
                  <label
                    key={opt.id}
                    className={`readiness-inline__option${selected ? ' is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      className="readiness-inline__radio"
                      name={q.id}
                      value={opt.id}
                      checked={selected}
                      onChange={() => choose(q.id, opt.id)}
                    />
                    <span className="readiness-inline__option-text">{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )
      })}

      <button
        className="readiness-inline__submit"
        type="submit"
        disabled={submitting}
      >
        Ver mi lectura
      </button>

      <p className="readiness-inline__note">
        El resultado sale de tus respuestas con reglas claras, sin IA y sin cifras
        inventadas. No guardamos nada de esto.
      </p>
    </form>
  )
}

// ─── ReadinessEvidenceCard ────────────────────────────────────────────────────
// Read-only display of a ReadinessResult as a compact evidence card.
// Mirrors GeoEvidenceCard structure. WCAG: no teal for body text.

function ReadinessEvidenceCard({ readiness }: { readiness: ReadinessResult }) {
  return (
    <div className="readiness-card" aria-label="Resultado del autodiagnostico AI Readiness">
      <span
        className={`readiness-card__chip readiness-card__chip--${readiness.tone}`}
        aria-label={`Lectura: ${READINESS_TONE_CHIP[readiness.tone]}`}
      >
        {READINESS_TONE_CHIP[readiness.tone]}
      </span>
      <p className="readiness-card__verdict">{readiness.verdict}</p>
      <dl className="readiness-card__dl">
        <div className="readiness-card__item">
          <dt>Donde te aporta hoy</dt>
          <dd>{readiness.aporta}</dd>
        </div>
        <div className="readiness-card__item">
          <dt>Donde no, todavia</dt>
          <dd>{readiness.todavia}</dd>
        </div>
        <div className="readiness-card__item">
          <dt>Tu primer paso</dt>
          <dd>{readiness.primerPaso}</dd>
        </div>
      </dl>
      {readiness.service !== 'ninguno' && (
        <a className="readiness-card__service" href={readiness.serviceHref}>
          {readiness.serviceLabel}
        </a>
      )}
      <p className="readiness-card__note">
        Sale de tus respuestas con reglas claras, sin IA y sin cifras inventadas.
        Es una orientacion, no una auditoria: esa va mas a fondo, contigo.
      </p>
    </div>
  )
}

// ─── AutomationInlineForm ─────────────────────────────────────────────────────
// Compact automation sketch widget rendered inline when the assistant emits
// [[BOCETO_AUTOMATIZACION]]. Runs once per widget instance; locks after a
// successful result (live OR fallback). Network errors keep the form unlocked
// for retry. On success, calls onResult with the sketch and task.

interface AutomationInlineFormProps {
  onResult: (
    sketch: AutomationSketch | null,
    fallbackNotice: string | null,
    task: string,
  ) => void
}

function AutomationInlineForm({ onResult }: AutomationInlineFormProps) {
  const [task, setTask] = useState('')
  const [taskError, setTaskError] = useState(false)
  const [posting, setPosting] = useState(false)
  const [locked, setLocked] = useState(false)

  const taskRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus textarea on mount.
  useEffect(() => {
    requestAnimationFrame(() => taskRef.current?.focus())
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (posting || locked) return

    const cleanTask = task.trim()
    if (cleanTask.length < SKETCH_INPUT_MIN) {
      setTaskError(true)
      taskRef.current?.focus()
      return
    }
    setTaskError(false)
    setPosting(true)

    try {
      const res = await fetch('/api/automation-sketch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: cleanTask }),
      })

      const data = (await res.json()) as {
        source?: 'live' | 'fallback'
        sketch?: AutomationSketch | null
        fallbackNotice?: string
      }

      // Lock the form — both live and fallback lock so the widget runs once.
      setLocked(true)
      if (data.source === 'live' && data.sketch) {
        onResult(data.sketch, null, cleanTask)
      } else {
        onResult(null, data.fallbackNotice ?? null, cleanTask)
      }
    } catch {
      // Network error: keep form unlocked so the user can retry.
      setPosting(false)
    }
  }

  if (locked) {
    return (
      <div className="automation-inline__locked" aria-live="polite">
        <span className="automation-inline__dot" aria-hidden="true" />
        Dibujando el esbozo...
      </div>
    )
  }

  return (
    <form
      className="automation-inline"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Esbozo de automatizacion"
    >
      <p className="automation-inline__eyebrow">Esbozo de automatizacion</p>
      <p className="automation-inline__lede">
        Describe una tarea repetitiva que te come tiempo. Le preguntamos en
        vivo a una IA que parte se podria automatizar y que parte no.
      </p>

      <div className="automation-inline__field">
        <label className="automation-inline__label" htmlFor="automation-inline-task">
          La tarea que repites{' '}
          <span className="automation-inline__req">(necesario)</span>
        </label>
        <textarea
          ref={taskRef}
          id="automation-inline-task"
          className="automation-inline__textarea"
          rows={3}
          maxLength={SKETCH_INPUT_MAX}
          placeholder="Ej: cada dia copio los pedidos del correo a un excel a mano, uno por uno."
          value={task}
          required
          aria-required="true"
          aria-invalid={taskError || undefined}
          aria-describedby={taskError ? 'automation-inline-task-error' : undefined}
          onChange={(e) => {
            setTask(e.target.value)
            if (taskError) setTaskError(false)
          }}
        />
        {taskError && (
          <p id="automation-inline-task-error" className="automation-inline__error" role="alert">
            Cuentame un poco mas de la tarea para poder esbozar algo util.
          </p>
        )}
      </div>

      <p className="automation-inline__note">
        Envia lo que escribas a un proveedor de IA (OpenRouter) para el esbozo.{' '}
        <a href="/privacidad" className="automation-inline__link">
          Como funciona
        </a>
        .
      </p>

      <button className="automation-inline__submit" type="submit" disabled={posting}>
        {posting ? 'Consultando...' : 'Ver el esbozo'}
      </button>
    </form>
  )
}

// ─── AutomationEvidenceCard ───────────────────────────────────────────────────
// Read-only display of an AutomationSketch as a compact evidence card.
// Mirrors GeoEvidenceCard structure with .sketch-card__* block.
// WCAG: no teal #3BAA8C for body text; chip uses light-on-dark forest surface.

const SKETCH_VERDICT_LABEL: Record<AutomationSketch['verdict'], string> = {
  yes: 'Tiene buena pinta para automatizar',
  partial: 'Una parte si, otra parte no',
  no: 'Tal y como lo cuentas, no compensa',
  unclear: 'Me falta contexto para decirte algo util',
}

function AutomationEvidenceCard({ sketch }: { sketch: AutomationSketch }) {
  return (
    <div className="sketch-card" aria-label="Resultado del esbozo de automatizacion">
      <span
        className={`sketch-card__chip sketch-card__chip--${sketch.verdict}`}
        aria-label={`Veredicto: ${SKETCH_VERDICT_LABEL[sketch.verdict]}`}
      >
        {SKETCH_VERDICT_LABEL[sketch.verdict]}
      </span>
      <dl className="sketch-card__dl">
        <div className="sketch-card__item">
          <dt>Que se podria automatizar</dt>
          <dd>{sketch.automatable}</dd>
        </div>
        <div className="sketch-card__item">
          <dt>Enfoque a grandes rasgos</dt>
          <dd>{sketch.approach}</dd>
        </div>
        <div className="sketch-card__item">
          <dt>Avisos honestos</dt>
          <dd>{sketch.caveats}</dd>
        </div>
      </dl>
      <p className="sketch-card__note">
        Esbozo a partir de lo que cuentas. No es una propuesta ni un presupuesto.
        Sin plazos ni precios: eso sale del discovery.
      </p>
    </div>
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

  // ─── Core model call (reusable) ──────────────────────────────────────────
  /**
   * Sends a message to /api/assistant and streams the reply into a new turn.
   *
   * @param modelMessage - The text sent to the API as the `message` field.
   * @param displayTurn  - The Turn pushed to `turns` for rendering.
   *                       Its `content` is also used as history content.
   * @param currentTurns - Snapshot of turns BEFORE pushing displayTurn.
   *                       Needed so the caller controls history correctly on
   *                       reinjection (avoids double-state read race).
   */
  async function runAssistantTurn({
    modelMessage,
    displayTurn,
    currentTurns,
  }: {
    modelMessage: string
    displayTurn: Turn
    currentTurns: Turn[]
  }) {
    // Build history from the turns before this one (skip the INTRO assistant turn at i===0).
    const priorHistory = currentTurns
      .filter((t, i) => !(i === 0 && t.role === 'assistant'))
      .map((t) => ({ role: t.role, content: t.content }))

    // Push the display turn, then reserve a slot for the assistant reply.
    let assistantIndex = -1
    setTurns((prev) => {
      const withDisplay = [...prev, displayTurn]
      assistantIndex = withDisplay.length
      return [...withDisplay, { role: 'assistant', content: '' }]
    })

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: modelMessage, history: priorHistory }),
      })

      const isDegraded = res.headers.get('x-assistant-degraded') === '1'

      // Streaming token by token; fall back to full text if no ReadableStream.
      let acc = ''
      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          acc += decoder.decode(value, { stream: true })
          // Strip all five tokens from visible text during streaming.
          const visible = acc
            .replace(OPEN_CONTACT_TOKEN, '')
            .replace(COLLECT_LEAD_TOKEN, '')
            .replace(RUN_GEO_TOKEN, '')
            .replace(READINESS_TOKEN, '')
            .replace(SKETCH_TOKEN, '')
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
      const collectLead = acc.includes(COLLECT_LEAD_TOKEN) && !isDegraded
      const runGeo = acc.includes(RUN_GEO_TOKEN) && !isDegraded
      const runReadiness = acc.includes(READINESS_TOKEN) && !isDegraded
      const runSketch = acc.includes(SKETCH_TOKEN) && !isDegraded
      const finalText = acc
        .replace(OPEN_CONTACT_TOKEN, '')
        .replace(COLLECT_LEAD_TOKEN, '')
        .replace(RUN_GEO_TOKEN, '')
        .replace(READINESS_TOKEN, '')
        .replace(SKETCH_TOKEN, '')
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
            runGeo,
            runReadiness,
            runSketch,
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
    }
  }

  // ─── Envio de un mensaje (uses runAssistantTurn) ──────────────────────────
  async function send(text: string) {
    const clean = text.trim()
    if (!clean || sending) return

    setInput('')
    setSending(true)

    // Snapshot of turns BEFORE the new user turn (for history).
    const currentTurns = turns

    try {
      await runAssistantTurn({
        modelMessage: clean,
        displayTurn: { role: 'user', content: clean },
        currentTurns,
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

  // ─── GEO reinjection handler ──────────────────────────────────────────────
  /**
   * Called by GeoInlineForm when the user submits the widget and the API
   * responds. Replaces the placeholder assistant turn with the evidence card
   * (or a fallback note), then reinjects into the model so it builds its
   * verdict on the real evidence.
   *
   * The reinjection consumes one user turn in history (intentional per spec).
   */
  function handleGeoResult(
    snapshot: GeoSnapshot | null,
    fallbackNotice: string | null,
    inputName: string,
    inputSector: string,
    inputZone: string,
  ) {
    setSending(true)

    if (snapshot) {
      // Build a concise model-facing summary of the evidence.
      const sectorPart = inputSector ? `, sector: ${inputSector}` : ''
      const zonePart = inputZone ? `, zona: ${inputZone}` : ''
      const modelMessage =
        `[Resultado de la radiografia GEO para ${inputName}${sectorPart}${zonePart}] ` +
        `Reconoce el negocio: ${snapshot.known}. ` +
        `Como lo describe una IA hoy: ${snapshot.describes} ` +
        `Recomendacion: ${snapshot.recommend} ` +
        `Lo que falta: ${snapshot.gap}. ` +
        `Construye ahora tu veredicto honesto sobre esta evidencia, sin repetirla literal: ` +
        `donde la IA le aporta y donde no. Si encaja, propon el siguiente paso.`

      // The evidence card turn (rendered as card, carries content for history).
      const evidenceTurn: Turn = {
        role: 'user',
        kind: 'geo-evidence',
        snapshot,
        content: modelMessage,
      }

      // Snapshot of turns right now (before evidence turn is pushed).
      const currentTurns = turns

      void runAssistantTurn({ modelMessage, displayTurn: evidenceTurn, currentTurns }).finally(
        () => {
          setSending(false)
          requestAnimationFrame(() => inputRef.current?.focus())
        },
      )
    } else {
      // Fallback: no live data — show a honest note and continue qualitatively.
      const notice = fallbackNotice ?? 'La radiografia GEO no pudo correr ahora mismo.'
      const modelMessage =
        `[La radiografia GEO no pudo correr ahora mismo, sin datos en vivo.] ` +
        `Continua la orientacion de forma cualitativa y honesta, sin inventar lo que ` +
        `sabria una IA de su negocio. Si encaja, propon el siguiente paso.`

      // The display turn shows the honest notice to the user.
      // The modelMessage (used for history) carries the framed context to the model.
      const fallbackDisplayTurn: Turn = {
        role: 'user',
        content: notice,
      }

      const currentTurns = turns

      void runAssistantTurn({
        modelMessage,
        displayTurn: fallbackDisplayTurn,
        currentTurns,
      }).finally(() => {
        setSending(false)
        requestAnimationFrame(() => inputRef.current?.focus())
      })
    }
  }

  // ─── AI Readiness reinjection handler ────────────────────────────────────
  /**
   * Called by ReadinessInlineForm when the user submits the widget.
   * readReadiness is synchronous — no fetch involved.
   * Reinjects the result into the model so it builds a verdict on the evidence.
   */
  function handleReadinessResult(result: ReadinessResult) {
    setSending(true)

    const modelMessage =
      `[Resultado del autodiagnostico AI Readiness] ` +
      `Lectura: ${result.tone}. ` +
      `Veredicto: ${result.verdict} ` +
      `Donde la IA aporta hoy: ${result.aporta} ` +
      `Donde no todavia: ${result.todavia} ` +
      `Primer paso: ${result.primerPaso} ` +
      `Servicio sugerido: ${result.serviceLabel || 'ninguno'}. ` +
      `Construye ahora tu veredicto honesto sobre esta lectura, sin repetirla literal: ` +
      `donde la IA le aporta y donde no. Si encaja, propon el siguiente paso.`

    const displayTurn: Turn = {
      role: 'user',
      kind: 'readiness-evidence',
      readiness: result,
      content: modelMessage,
    }

    const currentTurns = turns

    void runAssistantTurn({ modelMessage, displayTurn, currentTurns }).finally(() => {
      setSending(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    })
  }

  // ─── Automation Sketch reinjection handler ───────────────────────────────
  /**
   * Called by AutomationInlineForm when the user submits the widget and the
   * API responds. Reinjects the result into the model so it builds a verdict
   * on the real evidence.
   */
  function handleSketchResult(
    sketch: AutomationSketch | null,
    fallbackNotice: string | null,
    task: string,
  ) {
    setSending(true)

    if (sketch) {
      const modelMessage =
        `[Resultado del boceto de automatizacion para la tarea: ${task}] ` +
        `Compensa automatizar: ${sketch.verdict}. ` +
        `Que parte: ${sketch.automatable} ` +
        `Enfoque: ${sketch.approach} ` +
        `Avisos: ${sketch.caveats}. ` +
        `Construye ahora tu veredicto honesto sobre este esbozo, sin repetirlo literal: ` +
        `donde la IA le aporta y donde no. Si encaja, propon el siguiente paso.`

      const displayTurn: Turn = {
        role: 'user',
        kind: 'sketch-evidence',
        sketch,
        content: modelMessage,
      }

      const currentTurns = turns

      void runAssistantTurn({ modelMessage, displayTurn, currentTurns }).finally(() => {
        setSending(false)
        requestAnimationFrame(() => inputRef.current?.focus())
      })
    } else {
      // Fallback: no live data — show honest notice and continue qualitatively.
      const notice =
        fallbackNotice ?? 'El boceto de automatizacion no pudo correr ahora mismo.'
      const modelMessage =
        `[El boceto de automatizacion no pudo correr ahora mismo, sin datos en vivo.] ` +
        `Continua la orientacion de forma cualitativa y honesta, sin inventar el detalle del esbozo. ` +
        `Si encaja, propon el siguiente paso.`

      const fallbackDisplayTurn: Turn = {
        role: 'user',
        content: notice,
      }

      const currentTurns = turns

      void runAssistantTurn({
        modelMessage,
        displayTurn: fallbackDisplayTurn,
        currentTurns,
      }).finally(() => {
        setSending(false)
        requestAnimationFrame(() => inputRef.current?.focus())
      })
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
                }${t.kind === 'geo-evidence' ? ' assistant-msg--geo-evidence' : ''}${
                  t.kind === 'readiness-evidence' ? ' assistant-msg--readiness-evidence' : ''
                }${t.kind === 'sketch-evidence' ? ' assistant-msg--sketch-evidence' : ''}`}
              >
                {/* GEO evidence card: renders instead of plain text body */}
                {t.kind === 'geo-evidence' && t.snapshot ? (
                  <GeoEvidenceCard snapshot={t.snapshot} />
                ) : t.kind === 'readiness-evidence' && t.readiness ? (
                  /* AI Readiness evidence card: renders instead of plain text body */
                  <ReadinessEvidenceCard readiness={t.readiness} />
                ) : t.kind === 'sketch-evidence' && t.sketch ? (
                  /* Automation Sketch evidence card: renders instead of plain text body */
                  <AutomationEvidenceCard sketch={t.sketch} />
                ) : (
                  <p className="assistant-msg__body">
                    {t.content || (t.role === 'assistant' && sending ? '…' : '')}
                  </p>
                )}
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
                {/* GEO inline widget: rendered when the model emits [[RADIOGRAFIA_GEO]] */}
                {t.runGeo && (
                  <GeoInlineForm onResult={handleGeoResult} />
                )}
                {/* AI Readiness inline widget: rendered when model emits [[AI_READINESS]] */}
                {t.runReadiness && (
                  <ReadinessInlineForm onResult={handleReadinessResult} />
                )}
                {/* Automation Sketch inline widget: rendered when model emits [[BOCETO_AUTOMATIZACION]] */}
                {t.runSketch && (
                  <AutomationInlineForm onResult={handleSketchResult} />
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
