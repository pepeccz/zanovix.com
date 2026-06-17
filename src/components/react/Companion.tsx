/**
 * Companion.tsx — el asistente que piensa en voz alta (v1 determinista)
 *
 * Eje de la home. En vez de un formulario o un chatbot, el visitante
 * cuenta que hace su empresa y el asistente MUESTRA lo que infiere
 * (sector, lo que le preocupa, urgencia) de forma editable. La
 * transparencia es la demo de "IA aplicada con honestidad": ves a la
 * herramienta razonar y la corriges.
 *
 * v1 = rulesInferencer (sin red). v2 = llmInferencer (mismo contrato).
 * La superficie React no cambia entre versiones.
 *
 * Variantes:
 *   hero — panel completo (home, client:load).
 *   dock — forma reducida persistente en paginas internas (client:visible);
 *          solo se muestra si hay contexto guardado en sessionStorage.
 *
 * A11y: input etiquetado, aria-live en transiciones de estado, teclado
 * completo, foco visible. Reduced-motion: salta al estado final.
 * Sin JS: hero muestra copy + CTA a /contacto (formulario); dock no aparece
 * (progressive enhancement).
 */

import { useEffect, useRef, useState } from 'react'
import {
  rulesInferencer,
  requestGeoSnapshot,
  SECTOR_OPTIONS,
  PAIN_OPTIONS,
  URGENCY_OPTIONS,
  SECTOR_FALLBACK,
  PAIN_FALLBACK,
} from '../../lib/companion/infer'
import { readContext, writeContext, clearContext } from '../../lib/companion/context'
import type { CompanionContext } from '../../lib/companion/context'
import type { GeoSnapshot } from '../../lib/companion/geo'

type Phase = 'idle' | 'thinking' | 'result'

/** Sub-estado de la radiografia GEO dentro de la fase 'result'. */
type GeoPhase = 'offer' | 'asking' | 'done'

/** Etiqueta honesta del veredicto del modelo segun reconozca el negocio. */
const GEO_KNOWN_LABEL: Record<GeoSnapshot['known'], string> = {
  yes: 'Una IA te reconoce',
  no: 'Una IA no te conoce todavia',
  unclear: 'Una IA conoce tu categoria, no tu negocio',
}

const THINKING_LINES = [
  'Leyendo lo que me cuentas',
  'Situando tu sector',
  'Viendo donde te buscan tus clientes',
  'Anotando lo que mas te pesa',
]

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return (
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// ─── Variante hero ────────────────────────────────────────────────────────────

function CompanionHero() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [input, setInput] = useState('')
  const [ctx, setCtx] = useState<CompanionContext>({
    sector: SECTOR_FALLBACK,
    pain: PAIN_FALLBACK,
    urgency: URGENCY_OPTIONS[0]!,
  })
  // ── Estado de la radiografia GEO en vivo ──
  const [geoPhase, setGeoPhase] = useState<GeoPhase>('offer')
  const [geoConsent, setGeoConsent] = useState(false)
  const [geoSnapshot, setGeoSnapshot] = useState<GeoSnapshot | null>(null)
  const [geoNotice, setGeoNotice] = useState<string | null>(null)
  const timers = useRef<number[]>([])
  const resultRef = useRef<HTMLDivElement>(null)
  const geoResultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => timers.current.forEach((t) => clearTimeout(t))
  }, [])

  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    if (prefersReducedMotion()) {
      const result = await rulesInferencer.infer(text, ctx)
      setCtx(result)
      writeContext(result)
      setPhase('result')
      return
    }

    clearTimers()
    setPhase('thinking')

    const result = await rulesInferencer.infer(text, ctx)

    const total = THINKING_LINES.length * 420 + 350
    timers.current.push(
      window.setTimeout(() => {
        setCtx(result)
        writeContext(result)
        setPhase('result')
      }, total)
    )
  }

  function reset() {
    clearTimers()
    setInput('')
    clearContext()
    setCtx({ sector: SECTOR_FALLBACK, pain: PAIN_FALLBACK, urgency: URGENCY_OPTIONS[0]! })
    setGeoPhase('offer')
    setGeoConsent(false)
    setGeoSnapshot(null)
    setGeoNotice(null)
    setPhase('idle')
  }

  /**
   * Pide la radiografia GEO. SOLO se llama tras consentimiento explicito
   * (el boton esta deshabilitado hasta marcar el checkbox). Esta es la unica
   * accion que envia el texto del visitante a un proveedor de IA externo.
   */
  async function handleGeo() {
    if (!geoConsent || geoPhase === 'asking') return
    setGeoNotice(null)
    setGeoPhase('asking')
    const result = await requestGeoSnapshot(ctx.raw ?? input, ctx)
    if (result.source === 'live' && result.snapshot) {
      setGeoSnapshot(result.snapshot)
      setGeoNotice(null)
    } else {
      setGeoSnapshot(null)
      setGeoNotice(result.fallbackNotice ?? null)
    }
    setGeoPhase('done')
  }

  // Foco al encabezado del perfil al entrar en result
  useEffect(() => {
    if (phase === 'result' && resultRef.current) {
      resultRef.current.focus()
    }
  }, [phase])

  // Foco al resultado de la radiografia cuando termina
  useEffect(() => {
    if (geoPhase === 'done' && geoResultRef.current) {
      geoResultRef.current.focus()
    }
  }, [geoPhase])

  return (
    <section className="companion" aria-label="Asistente de Zanovix">
      <p className="companion__head">
        <span className="companion__dot" aria-hidden="true" />
        Asistente Zanovix
      </p>

      {phase === 'idle' && (
        <>
          <p className="companion__prompt">
            Cuentame que hace tu empresa y te enseno como te ve hoy una IA.
          </p>
          <form className="companion__form" onSubmit={handleSubmit}>
            <label htmlFor="companion-input" className="sr-only">
              Que hace tu empresa
            </label>
            <input
              id="companion-input"
              className="companion__input"
              type="text"
              autoComplete="off"
              placeholder="Ej: tengo un restaurante en Malaga"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="companion__submit" type="submit">
              Probar
            </button>
          </form>
          <p className="companion__note">
            Es una demostracion en vivo, no un formulario. Nada se envia hasta
            que tu lo decides, y puedes corregir lo que entienda.{' '}
            <a href="/privacidad" className="companion__note-link">
              Como funciona
            </a>
            .
          </p>
        </>
      )}

      {phase === 'thinking' && (
        <>
          {/* Anuncio accesible: el lector lo lee aunque la lista sea aria-hidden */}
          <p className="sr-only" aria-live="polite">
            Procesando lo que nos has contado
          </p>
          <ul className="companion__think" aria-hidden="true">
            {THINKING_LINES.map((line, i) => (
              <li
                key={line}
                className="companion__think-line"
                style={{ animationDelay: `${i * 420}ms` }}
              >
                {line}
              </li>
            ))}
          </ul>
        </>
      )}

      {phase === 'result' && (
        <div ref={resultRef} tabIndex={-1} aria-live="polite">
          <p className="companion__prompt">Esto es lo que entiendo. Afinalo si me equivoco.</p>
          <div className="companion__profile">
            <div className="companion__row">
              <label className="companion__row-label" htmlFor="companion-sector">
                Tu sector
              </label>
              <select
                id="companion-sector"
                className="companion__select"
                value={ctx.sector}
                onChange={(e) => setCtx((c) => ({ ...c, sector: e.target.value }))}
              >
                {ctx.sector === SECTOR_FALLBACK && (
                  <option value={SECTOR_FALLBACK}>{SECTOR_FALLBACK}</option>
                )}
                {SECTOR_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="companion__row">
              <label className="companion__row-label" htmlFor="companion-pain">
                Lo que mas te pesa
              </label>
              <select
                id="companion-pain"
                className="companion__select"
                value={ctx.pain}
                onChange={(e) => setCtx((c) => ({ ...c, pain: e.target.value }))}
              >
                {PAIN_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="companion__row">
              <label className="companion__row-label" htmlFor="companion-urgency">
                Como lo vives
              </label>
              <select
                id="companion-urgency"
                className="companion__select"
                value={ctx.urgency}
                onChange={(e) => setCtx((c) => ({ ...c, urgency: e.target.value }))}
              >
                {URGENCY_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Radiografia GEO en vivo ──────────────────────────────── */}
          <div className="companion__geo">
            {geoPhase === 'offer' && (
              <>
                <p className="companion__geo-title">
                  ¿Quieres ver como te describe hoy una IA?
                </p>
                <p className="companion__geo-lede">
                  Le preguntamos en vivo a un modelo de IA que sabe de tu
                  negocio y si te recomendaria cuando alguien pregunta por lo
                  tuyo. Te enseñamos su respuesta tal cual.
                </p>
                <label className="companion__consent">
                  <input
                    type="checkbox"
                    className="companion__consent-box"
                    checked={geoConsent}
                    onChange={(e) => setGeoConsent(e.target.checked)}
                  />
                  <span>
                    Entiendo que esto envia el texto que he escrito a un
                    proveedor de IA externo (OpenRouter) para generar la
                    radiografia.
                  </span>
                </label>
                <button
                  className="companion__submit companion__geo-go"
                  type="button"
                  onClick={handleGeo}
                  disabled={!geoConsent}
                >
                  Ver mi radiografia
                </button>
                <p className="companion__note">
                  Refleja lo que la IA aprendio en su entrenamiento, no una
                  auditoria en vivo de tu web. Es una aproximacion, no un
                  crawler.
                </p>
              </>
            )}

            {geoPhase === 'asking' && (
              <>
                <p className="sr-only" aria-live="polite">
                  Preguntando a la IA por tu negocio
                </p>
                <p className="companion__geo-asking" aria-hidden="true">
                  <span className="companion__dot" /> Preguntando a la IA por tu
                  negocio
                </p>
              </>
            )}

            {geoPhase === 'done' && (
              <div ref={geoResultRef} tabIndex={-1} aria-live="polite">
                {geoSnapshot ? (
                  <>
                    <p className="companion__geo-verdict">
                      {GEO_KNOWN_LABEL[geoSnapshot.known]}
                    </p>
                    <dl className="companion__geo-dl">
                      <div className="companion__geo-item">
                        <dt>Como te describe</dt>
                        <dd>{geoSnapshot.describes}</dd>
                      </div>
                      <div className="companion__geo-item">
                        <dt>Si te recomendaria</dt>
                        <dd>{geoSnapshot.recommend}</dd>
                      </div>
                      <div className="companion__geo-item">
                        <dt>Que le falta</dt>
                        <dd>{geoSnapshot.gap}</dd>
                      </div>
                    </dl>
                    <p className="companion__note">
                      Esta es la respuesta real del modelo. Refleja su
                      conocimiento, no una auditoria de tu web. Aqui es donde
                      entramos nosotros.
                    </p>
                  </>
                ) : (
                  <p className="companion__geo-fallback">
                    {geoNotice ??
                      'No he podido preguntarle a la IA en vivo ahora mismo.'}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="companion__actions">
            <a className="companion__cta" href="/contacto">
              Seguir con una persona
            </a>
            <button className="companion__reset" type="button" onClick={reset}>
              Empezar de nuevo
            </button>
          </div>
          <p className="companion__note">
            Con esto llegamos a la conversacion sabiendo ya de que hablamos. Tu
            decides que compartes.{' '}
            <a href="/privacidad" className="companion__note-link">
              Como funciona
            </a>
            .
          </p>
        </div>
      )}
    </section>
  )
}

// ─── Variante dock ────────────────────────────────────────────────────────────

function CompanionDock() {
  const [ctx, setCtx] = useState<CompanionContext | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Solo se muestra si hay contexto guardado desde la home
    setCtx(readContext())
  }, [])

  // Sin contexto, o descartado por el visitante: no renderizar nada
  if (!ctx || dismissed) return null

  return (
    <aside className="companion-dock" aria-label="Contexto del asistente Zanovix">
      <p className="companion-dock__head">
        <span className="companion__dot" aria-hidden="true" />
        <span className="companion-dock__title">Asistente Zanovix</span>
        <button
          type="button"
          className="companion-dock__dismiss"
          aria-label="Cerrar el resumen del asistente"
          onClick={() => setDismissed(true)}
        >
          <span aria-hidden="true">×</span>
        </button>
      </p>
      <dl className="companion-dock__summary">
        <div className="companion-dock__row">
          <dt>Sector</dt>
          <dd>{ctx.sector}</dd>
        </div>
        <div className="companion-dock__row">
          <dt>Lo que mas pesa</dt>
          <dd>{ctx.pain}</dd>
        </div>
      </dl>
      <a className="companion__cta companion-dock__cta" href="/contacto">
        Seguir con una persona
      </a>
    </aside>
  )
}

// ─── Superficie publica ───────────────────────────────────────────────────────

interface Props {
  variant?: 'hero' | 'dock'
}

export default function Companion({ variant = 'hero' }: Props) {
  if (variant === 'dock') return <CompanionDock />
  return <CompanionHero />
}
