/**
 * hero-choreography.ts — timeline GSAP de entrada del hero + scroll continuation
 *
 * Coreografía entrance (~1.5s total, t=0.00 → 1.50s):
 *   t=0.00  → eyebrow fade in + y shift (Inter lede)
 *   t=0.10  → headline chars stagger in (splitChars, power3.out)
 *   t=0.20  → grid SVG fade in (opacity → 0.06)
 *   t=0.25  → paths SVG drawPath secuencia staggered (c1→c7)
 *   t=0.75  → nodos scale(0 → 1) stagger, back.out(1.4)
 *   t=1.10  → n5-ring pulse opacity
 *   t=1.15  → labels fade in staggered
 *   t=1.20  → hero-lede opacity in
 *   t=1.30  → SVG wrapper opacity 1 (normalization)
 *   t=1.50  → ScrollTrigger continuation activo
 *
 * Scroll continuation (scrub, no pin — ADR-004):
 *   - ScrollTrigger.create: trigger #hero, start top top, end bottom top
 *   - Paths drift -20px X, nodes opacity → 0.4, headline parallax suave y=25px
 *
 * REQ-HC-2: entrada ~1.5s con narrativa texto → paths → nodos → labels
 * REQ-HC-3: reduced-motion → skip timeline, estado final instantáneo
 * REQ-HC-4: scroll continuation scrub 0.8, sin pin
 * REQ-HC-5: timeline unificado en este módulo
 * ADR-004: NO ScrollTrigger.pin
 * ADR-009: timebox ~250 LOC combinado con HeroAbstract
 *
 * NOTA: NO usa revealStagger (bug latente flagged en verify-report-pr2).
 * Stagger hecho directamente con gsap.timeline + stagger.
 */

import { gsap, ScrollTrigger } from './gsap'
import { splitChars, drawPath } from './animations'

function initHeroChoreography(): void {
  // ── Reduced-motion guard ──────────────────────────────────────────────────
  const reduced = document.documentElement.dataset.motion === 'reduced'

  const headline    = document.getElementById('hero-headline') as HTMLElement | null
  const eyebrow     = document.getElementById('hero-eyebrow') as HTMLElement | null
  const lede        = document.getElementById('hero-lede') as HTMLElement | null
  const svgWrapper  = document.getElementById('hero-svg-wrapper') as HTMLElement | null
  const grid        = document.getElementById('grid') as SVGGElement | null
  const labelsGroup = document.getElementById('labels') as SVGGElement | null
  const n5Ring      = document.getElementById('n5-ring') as SVGCircleElement | null

  // Selects todos los paths de conexión (c1–c7)
  const connectionPaths = Array.from(
    document.querySelectorAll<SVGPathElement>('#connections path[id]')
  )

  // Nodos: círculos y rects con ID n1–n8 (excluye n5-inner y n5-ring)
  const nodePaths = Array.from(
    document.querySelectorAll<SVGGeometryElement>(
      '#nodes circle:not(#n5-inner):not(#n5-ring), #nodes rect'
    )
  )

  // Labels individuales
  const labelTexts = Array.from(
    document.querySelectorAll<SVGTextElement>('#labels text')
  )

  // ── Reduced-motion: mostrar todo en estado final ──────────────────────────
  if (reduced) {
    if (eyebrow)     eyebrow.style.opacity    = '1'
    if (headline)    headline.style.opacity   = '1'
    if (lede)        lede.style.opacity       = '1'
    if (svgWrapper)  svgWrapper.style.opacity = '1'
    if (labelsGroup) labelsGroup.style.opacity = '1'

    // SVG paths completos: strokeDashoffset = 0
    connectionPaths.forEach((p) => {
      try {
        const len = p.getTotalLength()
        p.style.strokeDasharray = String(len)
        p.style.strokeDashoffset = '0'
      } catch {
        // getTotalLength puede fallar en SVGs no renderizados todavía
      }
    })

    // Nodos visibles
    nodePaths.forEach((n) => {
      (n as unknown as HTMLElement).style.transform = 'scale(1)'
    })

    return
  }

  // ── Setup estado inicial ──────────────────────────────────────────────────
  // SVG wrapper ya en opacity:0 via Astro. Grid invisible, nodos scale 0.
  if (grid) gsap.set(grid, { opacity: 0 })
  gsap.set(nodePaths, { scale: 0, transformOrigin: '50% 50%' })
  gsap.set(labelTexts, { opacity: 0, y: -3 })
  if (n5Ring) gsap.set(n5Ring, { opacity: 0 })

  // Inicializar paths con strokeDashoffset para drawPath
  connectionPaths.forEach((p) => {
    try {
      const len = p.getTotalLength()
      p.style.strokeDasharray = String(len)
      p.style.strokeDashoffset = String(len)
    } catch {
      // noop
    }
  })

  // ── GSAP Timeline entrance ─────────────────────────────────────────────────
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
  })

  // t=0.00 → eyebrow + SVG wrapper fade in together
  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.4 }, 0.0)
  tl.to(svgWrapper, { opacity: 1, duration: 0.2 }, 0.0)

  // t=0.10 → headline: splitChars + stagger
  tl.call(
    () => {
      if (!headline) return
      const chars = splitChars(headline)
      if (chars.length === 0) {
        // reduced-motion path dentro de splitChars — ya manejado arriba
        gsap.set(headline, { opacity: 1 })
        return
      }
      // Estado inicial de los chars
      gsap.set(chars, { opacity: 0, y: '0.3em' })
      gsap.set(headline, { opacity: 1 }) // hacer visible el contenedor
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.012,
        ease: 'power3.out',
      })
    },
    [],
    0.12
  )

  // t=0.20 → grid SVG fade in (blueprint de fondo, muy sutil)
  tl.to(grid, { opacity: 0.06, duration: 0.6, ease: 'power1.out' }, 0.20)

  // t=0.25 → paths drawPath staggered (c1 → c7)
  connectionPaths.forEach((path, i) => {
    const startTime = 0.25 + i * 0.07
    tl.call(
      () => {
        drawPath(path, { duration: 0.55, ease: 'power2.out' })
      },
      [],
      startTime
    )
  })

  // t=0.75 → nodos scale in staggered (back.out para feel mecánico)
  tl.to(
    nodePaths,
    {
      scale: 1,
      duration: 0.45,
      stagger: 0.05,
      ease: 'back.out(1.4)',
      transformOrigin: '50% 50%',
    },
    0.75
  )

  // t=1.10 → n5-ring pulse (acento teal)
  if (n5Ring) {
    tl.to(n5Ring, { opacity: 0.35, duration: 0.3, ease: 'power2.out' }, 1.10)
    // Pulso sutil loop (después del entrance)
    tl.call(
      () => {
        gsap.to(n5Ring, {
          opacity: 0.1,
          duration: 1.8,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true,
        })
      },
      [],
      1.45
    )
  }

  // t=1.15 → labels fade in staggered
  tl.to(
    labelTexts,
    {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.08,
      ease: 'power2.out',
    },
    1.15
  )

  // t=1.20 → lede fade in
  tl.to(lede, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 1.20)

  // ── Scroll continuation (scrub, no pin — ADR-004) ─────────────────────────
  // Activo después del entrance. El scrub da sensación de continuación
  // sin PIN para evitar conflictos con Lenis (ADR-004).
  tl.call(
    () => {
      const heroSection = document.getElementById('hero')
      const heroText    = document.getElementById('hero-text')
      if (!heroSection) return

      ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        onUpdate: (self) => {
          const progress = self.progress
          // Paths: drift sutil en X → sensación de mecanismo que "queda atrás"
          gsap.set('#connections', { x: progress * -18 })
          // Nodos: fade a 0.4 opacity conforme scroll avanza
          gsap.set(nodePaths, { opacity: 1 - progress * 0.55 })
          // Headline parallax suave
          if (heroText) gsap.set(heroText, { y: progress * 28 })
        },
      })
    },
    [],
    1.55
  )
}

// ── Entry point ───────────────────────────────────────────────────────────────
// Ejecutar cuando el DOM esté listo y el hero exista en la página
if (typeof window !== 'undefined') {
  const heroEl = document.getElementById('hero')
  if (heroEl) {
    // Si GSAP ya está registrado (motion-bootstrap corrió primero), iniciar directo
    // Si no, esperar DOMContentLoaded (edge case: script ejecuta antes del bootstrap)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initHeroChoreography)
    } else {
      // Un tick de event loop para que motion-bootstrap termine primero
      requestAnimationFrame(initHeroChoreography)
    }
  }
}
