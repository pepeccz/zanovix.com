/**
 * animations.ts — helpers de motion editorial
 *
 * Tres helpers:
 *   splitChars   — divide texto en spans animables (accesible)
 *   drawPath     — anima stroke-dashoffset nativo (reemplaza DrawSVG de Club)
 *   revealStagger — IntersectionObserver + stagger vía setTimeout (0KB lib extra)
 *
 * Todos respetan prefers-reduced-motion:
 *   - splitChars: no altera el DOM si reduced.
 *   - drawPath: estado final instantáneo si reduced.
 *   - revealStagger: aplica clase is-revealed inmediatamente si reduced.
 *
 * ADR-003: Sin GSAP Club plugins. drawPath usa getTotalLength() nativo.
 * ADR-010: Reveals vía IntersectionObserver, no animation-timeline (soporte parcial).
 */

import { gsap } from './gsap'

// ─── splitChars ──────────────────────────────────────────────────────────────

/**
 * Divide el contenido de texto de un elemento en spans individuales por carácter.
 * Accesible: el padre recibe aria-label con el texto original; los spans son aria-hidden.
 *
 * @returns Array de spans creados (para uso en gsap.from/to).
 */
export function splitChars(el: HTMLElement): HTMLSpanElement[] {
  // Reduced-motion guard: no alterar el DOM
  if (document.documentElement.dataset.motion === 'reduced') {
    return []
  }

  const original = el.textContent ?? ''
  el.setAttribute('aria-label', original)
  el.textContent = ''

  const spans: HTMLSpanElement[] = []

  for (const ch of [...original]) {
    if (ch === ' ') {
      // Espacio como texto plano — mantiene text wrapping nativo
      el.appendChild(document.createTextNode(' '))
    } else {
      const span = document.createElement('span')
      span.className = 'char'
      span.setAttribute('aria-hidden', 'true')
      span.style.display = 'inline-block' // necesario para transform: translateY
      span.textContent = ch
      el.appendChild(span)
      spans.push(span)
    }
  }

  return spans
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

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          const delay = idx * stagger
          setTimeout(() => {
            el.classList.add(className)
          }, delay)
          observer.unobserve(el)
        }
      })
    },
    { threshold, rootMargin }
  )

  Array.from(elements).forEach((el) => observer.observe(el))

  return observer
}
