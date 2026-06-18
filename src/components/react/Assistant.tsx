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
 * HANDOFF: cuando el modelo decide ofrecer hablar con una persona, termina con
 * la marca [[ABRIR_CONTACTO]]. La detectamos, la quitamos del texto visible y
 * mostramos un boton que dispara el evento global `zx:open-contact` con el
 * contexto de la conversacion (resumen), para abrir el ContactDialog. El
 * asistente NO recoge datos: hace handoff al formulario.
 *
 * A11y: panel como dialogo (role + aria-labelledby), foco gestionado al abrir y
 * al cerrar (vuelve al lanzador), Esc cierra, foco atrapado dentro del panel,
 * aria-live en las respuestas, teclado completo. reduced-motion: sin
 * transiciones (CSS).
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ASSISTANT_INPUT_MAX } from '../../lib/assistant/assistant'
import { OPEN_CONTACT_EVENT } from './ContactDialog'
import type { ContactDialogContext } from './ContactDialog'

type Role = 'user' | 'assistant'

interface Turn {
  role: Role
  content: string
  /** El asistente ofrecio abrir el formulario en este turno. */
  offerContact?: boolean
  /** El turno termino en degradacion (sin IA en vivo). */
  degraded?: boolean
}

/** Marca que el modelo añade para ofrecer el handoff al formulario. */
const OPEN_CONTACT_TOKEN = '[[ABRIR_CONTACTO]]'

const INTRO: Turn = {
  role: 'assistant',
  content:
    'Hola. Soy el asistente de Zanovix. Puedo contarte que hacemos, ayudarte a encontrar lo que buscas o, si lo ves claro, ponerte en contacto con una persona del equipo. Cuentame, ¿que te trae por aqui?',
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
          const visible = acc.replace(OPEN_CONTACT_TOKEN, '').trimEnd()
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
      const finalText = acc.replace(OPEN_CONTACT_TOKEN, '').trim()
      setTurns((prev) => {
        const next = [...prev]
        if (next[assistantIndex]) {
          next[assistantIndex] = {
            role: 'assistant',
            content:
              finalText ||
              'No he podido responderte ahora mismo. Escribenos y te contesta una persona.',
            offerContact: offerContact && !isDegraded,
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
                {t.offerContact && (
                  <button
                    type="button"
                    className="assistant-msg__handoff"
                    onClick={handoff}
                  >
                    Hablar con una persona
                  </button>
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
