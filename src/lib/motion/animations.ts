/**
 * animations.ts — helpers de motion editorial
 *
 * Cuatro helpers:
 *   prefersReducedMotion — fuente canónica del flag reduced-motion
 *   splitChars   — divide texto en spans animables (accesible)
 *   splitWords   — divide texto en spans por palabra (Cap 2 word-by-word)
 *   drawPath     — anima stroke-dashoffset nativo (reemplaza DrawSVG de Club)
 *   revealStagger — IntersectionObserver + stagger vía setTimeout (0KB lib extra)
 *
 * Todos respetan prefers-reduced-motion:
 *   - splitChars/splitWords: no altera el DOM si reduced.
 *   - drawPath: estado final instantáneo si reduced.
 *   - revealStagger: aplica clase is-revealed inmediatamente si reduced.
 *
 * ADR-003: Sin GSAP Club plugins. drawPath usa getTotalLength() nativo.
 * ADR-010: Reveals vía IntersectionObserver, no animation-timeline (soporte parcial).
 */

import { gsap } from './gsap'

// ─── prefersReducedMotion ─────────────────────────────────────────────────────

/**
 * Fuente canónica del flag reduced-motion.
 * Evaluado en runtime — cubre usuarios que activan RM después de la carga.
 *
 * Todos los registros de scroll-system.ts y hero-choreography.ts lo importan
 * de aquí. Una sola fuente de verdad.
 *
 * @returns true si el documento tiene data-motion="reduced" en <html>
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.dataset.motion === 'reduced'
  )
}

// ─── splitChars ──────────────────────────────────────────────────────────────

/**
 * Divide el contenido de un elemento en spans individuales por carácter,
 * preservando `<br>` y agrupando los chars en `.word` con `white-space: nowrap`
 * para que el word-wrap del browser ocurra en los espacios y NUNCA dentro de
 * una palabra.
 *
 * Accesible: el padre recibe aria-label con el texto original (line breaks →
 * espacios); los chars son aria-hidden.
 *
 * Estructura resultante:
 *   <h1 aria-label="...">
 *     <span class="word">     <-- inline-block + nowrap, agrupa chars
 *       <span class="char">S</span><span class="char">i</span>…
 *     </span>
 *     " "                      <-- text node, permite wrap natural
 *     <br>                     <-- preservado del HTML original
 *     <span class="word">…</span>
 *   </h1>
 *
 * @returns Array de spans `.char` creados (para uso en gsap.from/to).
 */
export function splitChars(el: HTMLElement): HTMLSpanElement[] {
  // Reduced-motion guard: no alterar el DOM
  if (document.documentElement.dataset.motion === 'reduced') {
    return []
  }

  // aria-label preserva el texto original colapsando whitespace y br a un espacio
  if (!el.hasAttribute('aria-label')) {
    el.setAttribute(
      'aria-label',
      (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
    )
  }

  // Snapshot de los childNodes originales antes de vaciar
  const originalNodes = Array.from(el.childNodes)
  el.textContent = ''

  const spans: HTMLSpanElement[] = []

  for (const node of originalNodes) {
    if (node.nodeName === 'BR') {
      el.appendChild(document.createElement('br'))
      continue
    }
    if (node.nodeType !== Node.TEXT_NODE) {
      // Elementos inline ajenos (ej. <em>) — se clonan como están
      el.appendChild(node.cloneNode(true))
      continue
    }

    const text = node.textContent ?? ''
    // Split preservando los grupos de whitespace como partes separadas
    const parts = text.split(/(\s+)/)

    for (const part of parts) {
      if (part === '') continue
      if (/^\s+$/.test(part)) {
        // Whitespace puro → text node, único punto de wrap permitido
        el.appendChild(document.createTextNode(part))
        continue
      }

      // Palabra: contenedor inline-block + nowrap atrapa los chars como unidad
      const wordSpan = document.createElement('span')
      wordSpan.className = 'word'
      wordSpan.style.display = 'inline-block'
      wordSpan.style.whiteSpace = 'nowrap'

      for (const ch of [...part]) {
        const charSpan = document.createElement('span')
        charSpan.className = 'char'
        charSpan.setAttribute('aria-hidden', 'true')
        charSpan.style.display = 'inline-block' // necesario para transform: translateY
        charSpan.textContent = ch
        wordSpan.appendChild(charSpan)
        spans.push(charSpan)
      }

      el.appendChild(wordSpan)
    }
  }

  return spans
}

// ─── splitWords ──────────────────────────────────────────────────────────────

/**
 * Divide el contenido de un elemento en spans por PALABRA (no por carácter),
 * preservando `<br>` y nodos inline ajenos como unidades.
 *
 * Complementa splitChars (ADR-010): splitChars para el H1 entrance (Cap 1),
 * splitWords para la declaración word-by-word (Cap 2).
 *
 * Accesible: el padre recibe aria-label con el texto original; los spans de
 * palabra llevan aria-hidden="true" para que screen readers no los doblen.
 *
 * Guard idempotente: si el elemento ya fue procesado (data-splitWordsApplied),
 * devuelve los spans existentes sin mutar el DOM.
 *
 * Edge cases:
 *   - Texto vacío → return []
 *   - Elementos inline (<em>, <strong>) → clonados como unidad, sin split
 *   - <br> → preservado
 *   - Whitespace puro → TextNode (permite word wrap natural del browser)
 *   - data-motion="reduced" → return [] sin mutar DOM
 *
 * @returns Array de spans `.word` en orden de aparición en el texto.
 */
export function splitWords(
  el: HTMLElement,
  opts: { wordClass?: string } = {}
): HTMLSpanElement[] {
  // Reduced-motion guard: no alterar el DOM
  if (prefersReducedMotion()) return []

  // Guard idempotente
  if (el.dataset.splitWordsApplied) {
    return Array.from(el.querySelectorAll<HTMLSpanElement>(
      `.${opts.wordClass ?? 'word'}`
    ))
  }

  // Texto vacío
  const rawText = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
  if (!rawText) return []

  // aria-label: preserva el texto original para screen readers
  if (!el.hasAttribute('aria-label')) {
    el.setAttribute('aria-label', rawText)
  }

  // Snapshot de childNodes antes de vaciar
  const originalNodes = Array.from(el.childNodes)
  el.textContent = ''

  const wordSpans: HTMLSpanElement[] = []
  const wordClass = opts.wordClass ?? 'word'
  let wordIndex = 0

  for (const node of originalNodes) {
    if (node.nodeName === 'BR') {
      el.appendChild(document.createElement('br'))
      continue
    }
    if (node.nodeType !== Node.TEXT_NODE) {
      // Elemento inline ajeno (ej. <em>, <strong>) — clonado como unidad, sin split
      el.appendChild(node.cloneNode(true))
      continue
    }

    const text = node.textContent ?? ''
    // Split preservando grupos de whitespace como partes separadas
    const parts = text.split(/(\s+)/)

    for (const part of parts) {
      if (part === '') continue
      if (/^\s+$/.test(part)) {
        // Whitespace puro → TextNode, único punto de wrap permitido
        el.appendChild(document.createTextNode(part))
        continue
      }

      // Palabra: span inline-block con aria-hidden para evitar doble lectura SR
      const span = document.createElement('span')
      span.className = wordClass
      span.setAttribute('aria-hidden', 'true')
      span.dataset.wordIndex = String(wordIndex)
      span.style.display = 'inline-block'
      span.textContent = part
      el.appendChild(span)
      wordSpans.push(span)
      wordIndex++
    }
  }

  // Marcar como procesado
  el.dataset.splitWordsApplied = '1'

  return wordSpans
}

// ─── drawPath ────────────────────────────────────────────────────────────────

interface DrawPathOptions {
  duration?: number
  delay?: number
  ease?: string
}

/**
 * Anima un <path> SVG desde invisible (strokeDashoffset = length) hasta visible.
 * Reemplaza DrawSVG de GSAP Club usando getTotalLength() nativo.
 *
 * @returns GSAP tween para encadenar en un timeline (caller controla el scrub).
 */
export function drawPath(
  path: SVGPathElement,
  opts: DrawPathOptions = {}
): gsap.core.Tween {
  const len = path.getTotalLength()

  // Estado inicial: path invisible
  path.style.strokeDasharray = String(len)
  path.style.strokeDashoffset = String(len)

  // Reduced-motion: estado final instantáneo, sin tween
  if (document.documentElement.dataset.motion === 'reduced') {
    path.style.strokeDashoffset = '0'
    return gsap.to(path, { strokeDashoffset: 0, duration: 0 })
  }

  return gsap.to(path, {
    strokeDashoffset: 0,
    duration: opts.duration ?? 1.2,
    delay: opts.delay ?? 0,
    ease: opts.ease ?? 'power2.out',
  })
}

// ─── revealStagger ───────────────────────────────────────────────────────────

interface RevealStaggerOptions {
  stagger?: number       // ms entre elementos (default: 80ms)
  threshold?: number     // IO threshold (default: 0.15)
  rootMargin?: string    // IO rootMargin (default: '0px 0px -40px 0px')
  className?: string     // clase a añadir al revelar (default: 'is-revealed')
}

/**
 * Observa un conjunto de elementos con IntersectionObserver.
 * Al entrar en viewport, añade className con stagger escalonado.
 * La animación real está en CSS (motion.css: .reveal → .reveal.is-revealed).
 *
 * @returns El IntersectionObserver (para disconnect() si se necesita cleanup).
 */
export function revealStagger(
  elements: HTMLElement[] | NodeListOf<HTMLElement>,
  opts: RevealStaggerOptions = {}
): IntersectionObserver {
  const {
    stagger = 80,
    threshold = 0.15,
    rootMargin = '0px 0px -40px 0px',
    className = 'is-revealed',
  } = opts

  const reduced = document.documentElement.dataset.motion === 'reduced'

  // Reduced-motion: mostrar todos instantáneamente
  if (reduced) {
    Array.from(elements).forEach((el) => el.classList.add(className))
    return new IntersectionObserver(() => {})
  }

  // Pre-asignar índice estable por elemento.
  // Fix bug latente: si IO disparaba en batches separados, el `idx` del
  // forEach se reseteaba a 0 cada batch y el stagger colapsaba. Ahora cada
  // elemento mantiene su posición original en la lista observada.
  const list = Array.from(elements)
  const indexOf = new WeakMap<Element, number>()
  list.forEach((el, i) => indexOf.set(el, i))

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        const idx = indexOf.get(el) ?? 0
        const delay = idx * stagger
        setTimeout(() => {
          el.classList.add(className)
        }, delay)
        observer.unobserve(el)
      }
    },
    { threshold, rootMargin }
  )

  for (const el of list) observer.observe(el)

  return observer
}
