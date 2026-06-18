/**
 * ReadinessCheck.tsx — autodiagnostico de AI Readiness (isla React)
 *
 * Pieza central de la pagina de servicio "Auditoria AI Readiness", paralela en
 * calidad al GeoSimulator. El visitante responde seis preguntas y recibe una
 * LECTURA HONESTA: donde la IA le aporta hoy, donde no (todavia) y un primer
 * paso concreto.
 *
 * DETERMINISTA, SIN LLM. Toda la logica vive en lib/readiness/readiness.ts:
 * cero coste, cero latencia, cero alucinacion. Lo que dice se puede auditar
 * leyendo ese archivo. El motor puede concluir que la IA NO es la prioridad
 * ahora ("antes que IA, conviene ordenar X"): eso es on-brand, no un fallo.
 *
 * ENCUADRE HONESTO: es una orientacion a partir de seis respuestas, NO una
 * auditoria real. La auditoria de verdad va mas a fondo, con discovery. Se
 * dice claro arriba y en el resultado. Sin prometer, sin cifras inventadas.
 *
 * NO recoge datos personales: solo respuestas de opcion multiple. El CTA final
 * hace handoff al dialogo de contacto (evento zx:open-contact) con el contexto
 * del diagnostico (sector / dolor / lectura) ya prellenado.
 *
 * A11y: un fieldset/legend por pregunta (radiogroup nativo), navegacion por
 * teclado completa, foco gestionado entre pasos (al avanzar, al volver, al
 * resultado), aria-live para el progreso y el resultado, reduced-motion (CSS).
 * Sin JS: la pagina muestra el bloque de respaldo y el CTA a /contacto.
 */

import { useEffect, useRef, useState } from 'react'
import {
  READINESS_QUESTIONS,
  readReadiness,
  sectorLabel,
  dolorLabel,
} from '../../lib/readiness/readiness'
import type { ReadinessAnswers, ReadinessResult } from '../../lib/readiness/readiness'
import { OPEN_CONTACT_EVENT } from './ContactDialog'
import type { ContactDialogContext } from './ContactDialog'

const TOTAL = READINESS_QUESTIONS.length

type Phase = 'questions' | 'result'

const TONE_TAG: Record<ReadinessResult['tone'], string> = {
  listo: 'Por aquí sí',
  parcial: 'Con cabeza',
  cimientos: 'Primero los cimientos',
}

export default function ReadinessCheck() {
  const [phase, setPhase] = useState<Phase>('questions')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<ReadinessAnswers>({})
  const [result, setResult] = useState<ReadinessResult | null>(null)

  const legendRef = useRef<HTMLLegendElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const question = READINESS_QUESTIONS[step]
  const current = answers[question.id]
  const isLast = step === TOTAL - 1

  // Al cambiar de pregunta, llevar el foco al enunciado (lector + teclado).
  useEffect(() => {
    if (phase === 'questions') legendRef.current?.focus()
  }, [step, phase])

  // Al llegar al resultado, foco al contenedor del veredicto.
  useEffect(() => {
    if (phase === 'result') resultRef.current?.focus()
  }, [phase])

  function choose(optionId: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
  }

  function next() {
    if (!current) return // el boton esta deshabilitado, doble guardia
    if (isLast) {
      setResult(readReadiness({ ...answers, [question.id]: current }))
      setPhase('result')
      return
    }
    setStep((s) => Math.min(s + 1, TOTAL - 1))
  }

  function back() {
    if (step === 0) return
    setStep((s) => Math.max(s - 1, 0))
  }

  function restart() {
    setAnswers({})
    setResult(null)
    setStep(0)
    setPhase('questions')
  }

  /**
   * Abre el dialogo de captacion con el contexto del diagnostico. Progressive
   * enhancement: respeta nueva pestana / modificadores y solo hace preventDefault
   * cuando de verdad va a abrir el dialogo (si no, el href="/contacto" navega).
   */
  function openContact(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    if (typeof window === 'undefined' || !result) return

    const sec = sectorLabel(answers)
    const dol = dolorLabel(answers)
    const verdict = `${result.verdict} (lectura: ${TONE_TAG[result.tone]})`

    const detail: ContactDialogContext & { trigger?: HTMLElement } = {
      sector: sec,
      geoVerdict: verdict,
      message: dol ? `Mi mayor dolor hoy: ${dol}` : undefined,
      origin: 'autodiagnostico-ai-readiness',
      trigger: e.currentTarget,
    }

    e.preventDefault()
    window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT, { detail }))
  }

  return (
    <div className="rcheck">
      <p className="rcheck__head">
        <span className="rcheck__dot" aria-hidden="true" />
        Autodiagnóstico de AI Readiness
      </p>

      {phase === 'questions' && (
        <div className="rcheck__quiz">
          <div className="rcheck__progress">
            <p className="sr-only" aria-live="polite">
              Pregunta {step + 1} de {TOTAL}
            </p>
            <span className="rcheck__count" aria-hidden="true">
              {step + 1} / {TOTAL}
            </span>
            <span className="rcheck__bar" aria-hidden="true">
              <span
                className="rcheck__bar-fill"
                style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              />
            </span>
          </div>

          <fieldset className="rcheck__fieldset">
            <legend className="rcheck__legend" ref={legendRef} tabIndex={-1}>
              {question.legend}
            </legend>
            {question.hint && <p className="rcheck__hint">{question.hint}</p>}

            <div className="rcheck__options" role="radiogroup" aria-label={question.legend}>
              {question.options.map((opt) => {
                const selected = current === opt.id
                return (
                  <label
                    key={opt.id}
                    className={`rcheck__option${selected ? ' is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      className="rcheck__radio"
                      name={question.id}
                      value={opt.id}
                      checked={selected}
                      onChange={() => choose(opt.id)}
                    />
                    <span className="rcheck__option-text">{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="rcheck__nav">
            <button
              className="rcheck__back"
              type="button"
              onClick={back}
              disabled={step === 0}
            >
              ← Atrás
            </button>
            <button
              className="rcheck__next"
              type="button"
              onClick={next}
              disabled={!current}
            >
              {isLast ? 'Ver mi lectura' : 'Siguiente'}
            </button>
          </div>

          <p className="rcheck__note">
            Son seis preguntas y una lectura honesta. Es una orientación, no una
            auditoría: la de verdad va más a fondo, contigo. No te pedimos datos
            personales aquí.
          </p>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="rcheck__result" ref={resultRef} tabIndex={-1} aria-live="polite">
          <p className={`rcheck__tag rcheck__tag--${result.tone}`}>{TONE_TAG[result.tone]}</p>
          <p className="rcheck__verdict">{result.verdict}</p>

          <dl className="rcheck__dl">
            <div className="rcheck__item">
              <dt>Dónde te aporta hoy</dt>
              <dd>{result.aporta}</dd>
            </div>
            <div className="rcheck__item">
              <dt>Dónde no, todavía</dt>
              <dd>{result.todavia}</dd>
            </div>
            <div className="rcheck__item rcheck__item--step">
              <dt>Tu primer paso</dt>
              <dd>{result.primerPaso}</dd>
            </div>
          </dl>

          <p className="rcheck__note">
            Esto sale de tus respuestas con reglas claras, sin IA y sin cifras
            inventadas. Es una orientación honesta, no una auditoría: esa va más
            a fondo, con una conversación.
          </p>

          <div className="rcheck__actions">
            <a
              className="rcheck__cta"
              href="/contacto"
              data-open-contact
              onClick={openContact}
            >
              {result.tone === 'cimientos' ? 'Contar mi caso igualmente' : 'Contar mi caso'}
            </a>
            {result.service !== 'ninguno' && (
              <a className="rcheck__service" href={result.serviceHref}>
                {result.serviceLabel}
              </a>
            )}
            <button className="rcheck__restart" type="button" onClick={restart}>
              Empezar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
