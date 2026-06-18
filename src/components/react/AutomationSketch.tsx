/**
 * AutomationSketch.tsx — esbozo de automatizacion (isla React)
 *
 * Pieza central de la pagina de servicio de software a medida. El visitante
 * describe una tarea repetitiva que le come tiempo (obligatorio) y, tras un
 * CONSENTIMIENTO explicito, le preguntamos en vivo a un modelo de IA (via
 * /api/automation-sketch) que parte se podria automatizar, con que enfoque a
 * grandes rasgos y con que avisos honestos.
 *
 * EL PRODUCTO ES LA HONESTIDAD: usamos la respuesta REAL del modelo. Es un
 * ESBOZO a partir de lo que cuentas, no una propuesta ni un presupuesto. El
 * prompt prohibe plazos, precios y cifras inventadas; si la tarea no compensa
 * automatizar, el modelo lo dice (sketch.ts). Degrada honesto sin
 * OPENROUTER_API_KEY: mensaje + CTA a contacto, sin romperse.
 *
 * A11y: textarea etiquetado y requerido con aria, consentimiento obligatorio
 * (boton deshabilitado hasta marcar), aria-live en cada transicion de estado,
 * foco gestionado al resultado, teclado completo, foco visible. Reduced-motion:
 * el "pensando" no anima y el resultado aparece sin transicion. Sin JS: la
 * pagina muestra el <noscript> y el CTA a /contacto (componente client:visible,
 * mejora progresiva).
 */

import { useEffect, useRef, useState } from 'react'
import { SKETCH_INPUT_MAX, SKETCH_INPUT_MIN } from '../../lib/automation/sketch'
import type { AutomationSketch as Sketch } from '../../lib/automation/sketch'
import { OPEN_CONTACT_EVENT } from './ContactDialog'
import type { ContactDialogContext } from './ContactDialog'

type Phase = 'form' | 'asking' | 'done'

/** Etiqueta honesta del veredicto de fondo. */
const VERDICT_LABEL: Record<Sketch['verdict'], string> = {
  yes: 'Esto tiene buena pinta para automatizar',
  partial: 'Una parte si, otra parte no',
  no: 'Tal y como lo cuentas, no compensa',
  unclear: 'Me falta contexto para decirte algo util',
}

const FALLBACK_NOTICE =
  'Ahora mismo no puedo dibujarte el esbozo en vivo. Si quieres, cuentanos la tarea y lo miramos contigo sin compromiso.'

export default function AutomationSketch() {
  const [phase, setPhase] = useState<Phase>('form')
  const [task, setTask] = useState('')
  const [consent, setConsent] = useState(false)
  const [sketch, setSketch] = useState<Sketch | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [taskError, setTaskError] = useState(false)

  const taskRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // Foco al resultado cuando termina la consulta (lector + teclado).
  useEffect(() => {
    if (phase === 'done' && resultRef.current) {
      resultRef.current.focus()
    }
  }, [phase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const cleanTask = task.trim()

    if (cleanTask.length < SKETCH_INPUT_MIN) {
      setTaskError(true)
      taskRef.current?.focus()
      return
    }
    setTaskError(false)
    if (!consent) return // el boton esta deshabilitado, doble guardia

    setNotice(null)
    setSketch(null)
    setPhase('asking')

    try {
      const res = await fetch('/api/automation-sketch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: cleanTask }),
      })

      if (!res.ok) {
        setNotice(FALLBACK_NOTICE)
        setPhase('done')
        return
      }

      const data = (await res.json()) as {
        source?: 'live' | 'fallback'
        sketch?: Sketch | null
        fallbackNotice?: string
      }

      if (data.source === 'live' && data.sketch) {
        setSketch(data.sketch)
        setNotice(null)
      } else {
        setSketch(null)
        setNotice(data.fallbackNotice || FALLBACK_NOTICE)
      }
      setPhase('done')
    } catch {
      setNotice(FALLBACK_NOTICE)
      setPhase('done')
    }
  }

  /**
   * Abre el dialogo de captacion en contexto pasando la tarea descrita y el
   * veredicto del esbozo como contexto, para que la conversacion arranque con
   * lo que ya sabemos. No recoge datos personales: eso solo viaja si rellenas
   * el formulario. Progressive enhancement: si no hay dialogo montado, el
   * href="/contacto" del <a> sigue navegando (no llamamos preventDefault hasta
   * confirmar que vamos a abrir).
   */
  function openContact(e: React.MouseEvent<HTMLAnchorElement>) {
    // Respeta nueva pestana / modificadores: deja navegar a /contacto.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    if (typeof window === 'undefined') return

    const cleanTask = task.trim()
    const lines: string[] = []
    if (cleanTask) lines.push(`Tarea que me come tiempo: ${cleanTask}`)
    if (sketch) {
      lines.push(`Esbozo: ${VERDICT_LABEL[sketch.verdict]}. ${sketch.automatable}`)
    } else if (notice) {
      lines.push('No se pudo generar el esbozo en vivo (degradado).')
    }
    lines.push('(Vengo del esbozo de automatizacion; es orientativo, no una propuesta.)')

    const detail: ContactDialogContext & { trigger?: HTMLElement } = {
      message: lines.join('\n'),
      origin: 'esbozo-automatizacion',
      trigger: e.currentTarget,
    }

    e.preventDefault()
    window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT, { detail }))
  }

  function reset() {
    setSketch(null)
    setNotice(null)
    setTaskError(false)
    setPhase('form')
    // No borramos lo escrito: afinar la descripcion de la tarea es util.
    requestAnimationFrame(() => taskRef.current?.focus())
  }

  return (
    <div className="asketch">
      <p className="asketch__head">
        <span className="asketch__dot" aria-hidden="true" />
        Esbozo de automatizacion en vivo
      </p>

      {phase === 'form' && (
        <form className="asketch__form" onSubmit={handleSubmit} noValidate>
          <p className="asketch__lede">
            Describe una tarea repetitiva que te come tiempo y cuentanos como la
            haces hoy. Le preguntamos en vivo a una IA que parte se podria
            automatizar y que parte no. Es un esbozo a partir de lo que cuentas,
            no una propuesta.
          </p>

          <div className="asketch__field">
            <label className="asketch__label" htmlFor="asketch-task">
              La tarea que repites <span className="asketch__req">(necesario)</span>
            </label>
            <textarea
              ref={taskRef}
              id="asketch-task"
              className="asketch__textarea"
              rows={4}
              maxLength={SKETCH_INPUT_MAX}
              placeholder="Ej: cada dia copio los pedidos del correo a un excel a mano, uno por uno."
              value={task}
              required
              aria-required="true"
              aria-invalid={taskError || undefined}
              aria-describedby={taskError ? 'asketch-task-error' : undefined}
              onChange={(e) => {
                setTask(e.target.value)
                if (taskError) setTaskError(false)
              }}
            />
            {taskError && (
              <p id="asketch-task-error" className="asketch__error" role="alert">
                Cuentame un poco mas de la tarea para poder esbozar algo util.
              </p>
            )}
          </div>

          <label className="asketch__consent">
            <input
              type="checkbox"
              className="asketch__consent-box"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              Entiendo que esto envia lo que he escrito a un proveedor de IA
              externo (OpenRouter) para generar el esbozo.{' '}
              <a href="/privacidad" className="asketch__link">
                Como funciona
              </a>
              .
            </span>
          </label>

          <button className="asketch__submit" type="submit" disabled={!consent}>
            Ver el esbozo
          </button>

          <p className="asketch__note">
            Esto es un esbozo a partir de lo que cuentas, no una propuesta ni un
            presupuesto. No te damos plazos ni precios: eso sale del discovery,
            hablando contigo.
          </p>
        </form>
      )}

      {phase === 'asking' && (
        <>
          <p className="sr-only" aria-live="polite">
            Dibujando el esbozo de tu tarea
          </p>
          <p className="asketch__asking" aria-hidden="true">
            <span className="asketch__dot" /> Dibujando el esbozo de tu tarea
          </p>
        </>
      )}

      {phase === 'done' && (
        <div ref={resultRef} tabIndex={-1} aria-live="polite">
          {sketch ? (
            <>
              <p className="asketch__verdict">{VERDICT_LABEL[sketch.verdict]}</p>
              <dl className="asketch__dl">
                <div className="asketch__item">
                  <dt>Que se podria automatizar</dt>
                  <dd>{sketch.automatable}</dd>
                </div>
                <div className="asketch__item">
                  <dt>Enfoque a grandes rasgos</dt>
                  <dd>{sketch.approach}</dd>
                </div>
                <div className="asketch__item">
                  <dt>Avisos honestos</dt>
                  <dd>{sketch.caveats}</dd>
                </div>
              </dl>
              <p className="asketch__note">
                Esto es un esbozo a partir de lo que cuentas, no una propuesta.
                La propuesta real sale del discovery, mirando tu caso de cerca.
              </p>
            </>
          ) : (
            <p className="asketch__fallback">{notice ?? FALLBACK_NOTICE}</p>
          )}

          <div className="asketch__actions">
            <a
              className="asketch__cta"
              href="/contacto"
              data-open-contact
              onClick={openContact}
            >
              Hablar de mi caso
            </a>
            <button className="asketch__reset" type="button" onClick={reset}>
              Probar otra tarea
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
