/**
 * GeoSimulator.tsx — simulador de radiografia GEO (isla React)
 *
 * Pieza central de la pagina de servicio GEO. El visitante escribe el NOMBRE
 * REAL de su negocio (obligatorio) y, opcionalmente, sector y zona. Tras un
 * CONSENTIMIENTO explicito, le preguntamos en vivo a un modelo de IA (via
 * /api/geo-snapshot) que sabe de ESE negocio por su nombre y si lo
 * mencionaria al buscar su categoria en su zona.
 *
 * EL PRODUCTO ES LA HONESTIDAD: usamos la respuesta REAL del modelo. Si no
 * conoce un negocio con ese nombre (lo normal en una pyme local), known="no"
 * y se muestra tal cual: "una IA no te conoce todavia". Ese es el momento que
 * vende GEO. Reglas de honestidad codificadas en geo.ts (no inventar
 * competidores, cifras ni rankings; aviso de que refleja el conocimiento del
 * modelo, no una auditoria en vivo). Degrada honesto sin OPENROUTER_API_KEY.
 *
 * A11y: campos etiquetados, nombre requerido con aria, aria-live en cada
 * transicion de estado, foco gestionado al resultado, teclado completo, foco
 * visible. Reduced-motion: el "preguntando" no anima, el resultado aparece sin
 * transicion. Sin JS: la pagina muestra el bloque estatico de respaldo y el
 * CTA a /contacto (este componente es client:visible, mejora progresiva).
 */

import { useEffect, useRef, useState } from 'react'
import { GEO_FIELD_MAX, GEO_NAME_MIN } from '../../lib/companion/geo'
import type { GeoSnapshot } from '../../lib/companion/geo'

type Phase = 'form' | 'asking' | 'done'

/** Etiqueta honesta del veredicto segun reconozca el negocio por su nombre. */
const KNOWN_LABEL: Record<GeoSnapshot['known'], string> = {
  yes: 'Una IA te reconoce',
  no: 'Una IA no te conoce todavia',
  unclear: 'Una IA conoce tu categoria, no tu negocio',
}

const FALLBACK_NOTICE =
  'No he podido preguntarle en vivo a una IA ahora mismo. Si quieres, escribenos y lo miramos contigo.'

export default function GeoSimulator() {
  const [phase, setPhase] = useState<Phase>('form')
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [zone, setZone] = useState('')
  const [consent, setConsent] = useState(false)
  const [snapshot, setSnapshot] = useState<GeoSnapshot | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [nameError, setNameError] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // Foco al resultado cuando termina la consulta (lector + teclado).
  useEffect(() => {
    if (phase === 'done' && resultRef.current) {
      resultRef.current.focus()
    }
  }, [phase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const cleanName = name.trim()

    if (cleanName.length < GEO_NAME_MIN) {
      setNameError(true)
      nameRef.current?.focus()
      return
    }
    setNameError(false)
    if (!consent) return // el boton esta deshabilitado, doble guardia

    setNotice(null)
    setSnapshot(null)
    setPhase('asking')

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

      if (!res.ok) {
        setNotice(FALLBACK_NOTICE)
        setPhase('done')
        return
      }

      const data = (await res.json()) as {
        source?: 'live' | 'fallback'
        snapshot?: GeoSnapshot | null
        fallbackNotice?: string
      }

      if (data.source === 'live' && data.snapshot) {
        setSnapshot(data.snapshot)
        setNotice(null)
      } else {
        setSnapshot(null)
        setNotice(data.fallbackNotice || FALLBACK_NOTICE)
      }
      setPhase('done')
    } catch {
      setNotice(FALLBACK_NOTICE)
      setPhase('done')
    }
  }

  function reset() {
    setSnapshot(null)
    setNotice(null)
    setNameError(false)
    setPhase('form')
    // No borramos lo escrito: probar otra variante del nombre es util.
    requestAnimationFrame(() => nameRef.current?.focus())
  }

  return (
    <div className="geosim">
      <p className="geosim__head">
        <span className="geosim__dot" aria-hidden="true" />
        Radiografia GEO en vivo
      </p>

      {phase === 'form' && (
        <form className="geosim__form" onSubmit={handleSubmit} noValidate>
          <p className="geosim__lede">
            Escribe el nombre real de tu negocio y le preguntamos en vivo a una
            IA que sabe de ti hoy. Lo normal, si eres una pyme, es que no te
            conozca todavia. Justo eso es lo que venimos a cambiar.
          </p>

          <div className="geosim__field">
            <label className="geosim__label" htmlFor="geosim-name">
              Nombre del negocio <span className="geosim__req">(necesario)</span>
            </label>
            <input
              ref={nameRef}
              id="geosim-name"
              className="geosim__input"
              type="text"
              autoComplete="organization"
              maxLength={GEO_FIELD_MAX}
              placeholder="Ej: Bar Manolo"
              value={name}
              required
              aria-required="true"
              aria-invalid={nameError || undefined}
              aria-describedby={nameError ? 'geosim-name-error' : undefined}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(false)
              }}
            />
            {nameError && (
              <p id="geosim-name-error" className="geosim__error" role="alert">
                Necesito el nombre real de tu negocio para preguntarle a la IA por el.
              </p>
            )}
          </div>

          <div className="geosim__pair">
            <div className="geosim__field">
              <label className="geosim__label" htmlFor="geosim-sector">
                Sector <span className="geosim__opt">(recomendado)</span>
              </label>
              <input
                id="geosim-sector"
                className="geosim__input"
                type="text"
                autoComplete="off"
                maxLength={GEO_FIELD_MAX}
                placeholder="Ej: restaurante, clinica dental"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              />
            </div>
            <div className="geosim__field">
              <label className="geosim__label" htmlFor="geosim-zone">
                Zona <span className="geosim__opt">(recomendado)</span>
              </label>
              <input
                id="geosim-zone"
                className="geosim__input"
                type="text"
                autoComplete="off"
                maxLength={GEO_FIELD_MAX}
                placeholder="Ej: Malaga centro"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
              />
            </div>
          </div>

          <label className="geosim__consent">
            <input
              type="checkbox"
              className="geosim__consent-box"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              Entiendo que esto envia lo que he escrito a un proveedor de IA
              externo (OpenRouter) para generar la radiografia.{' '}
              <a href="/privacidad" className="geosim__link">
                Como funciona
              </a>
              .
            </span>
          </label>

          <button className="geosim__submit" type="submit" disabled={!consent}>
            Ver mi radiografia
          </button>

          <p className="geosim__note">
            Refleja lo que la IA aprendio en su entrenamiento, no una auditoria
            en vivo de tu web. Es una aproximacion honesta, no un crawler.
          </p>
        </form>
      )}

      {phase === 'asking' && (
        <>
          <p className="sr-only" aria-live="polite">
            Preguntando a la IA por tu negocio
          </p>
          <p className="geosim__asking" aria-hidden="true">
            <span className="geosim__dot" /> Preguntando a la IA por{' '}
            {name.trim() || 'tu negocio'}
          </p>
        </>
      )}

      {phase === 'done' && (
        <div ref={resultRef} tabIndex={-1} aria-live="polite">
          {snapshot ? (
            <>
              <p className="geosim__verdict">{KNOWN_LABEL[snapshot.known]}</p>
              <dl className="geosim__dl">
                <div className="geosim__item">
                  <dt>Que sabe de ti</dt>
                  <dd>{snapshot.describes}</dd>
                </div>
                <div className="geosim__item">
                  <dt>Si te recomendaria</dt>
                  <dd>{snapshot.recommend}</dd>
                </div>
                <div className="geosim__item">
                  <dt>Que le falta</dt>
                  <dd>{snapshot.gap}</dd>
                </div>
              </dl>
              <p className="geosim__note">
                Esta es la respuesta real del modelo. Refleja su conocimiento,
                no una auditoria de tu web. Aqui es donde entramos nosotros.
              </p>
            </>
          ) : (
            <p className="geosim__fallback">{notice ?? FALLBACK_NOTICE}</p>
          )}

          <div className="geosim__actions">
            <a className="geosim__cta" href="/contacto">
              Contar mi caso
            </a>
            <button className="geosim__reset" type="button" onClick={reset}>
              Probar otro nombre
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
