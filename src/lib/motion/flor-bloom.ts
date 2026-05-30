/**
 * flor-bloom.ts — bloom de los 8 pétalos del hero scrub-driven
 *
 * Trigger: #hero (Cap1Hero)
 * Animación: cada pétalo + circle aparecen secuencialmente vía opacity 0 → 1
 *            con stagger lineal mapeado al progress del ScrollTrigger.
 *
 * Sin scale ni rotate desde JS: la rotación radial vive en el atributo SVG
 * `transform="rotate(N 50 50)"` del path, y GSAP no la toca para no romperla.
 * El efecto de bloom queda como aparición secuencial — atelier pausado.
 *
 * Sin pin (ADR-004). Sin Club plugins (ADR-003). Bidireccional natural via scrub.
 *
 * ADR-009: matchMedia desktop (768px+) / mobile → estado final estático.
 * Reduced-motion: estado final aplicado sin ScrollTrigger.
 *
 * SYNC: geometría pétalo idéntica a BrandMark.astro y /public/isotipo-mask.svg.
 */

import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './animations'

let registered = false
let mm: ReturnType<typeof gsap.matchMedia> | null = null

function getPetals(svg: Element): Element[] {
  const petals = Array.from({ length: 8 }, (_, i) => svg.querySelector(`#petal-${i}`))
  const center = svg.querySelector('#petal-center')
  return [...petals, center].filter(Boolean) as Element[]
}

export function registerFlorBloom(rootSelector = '#hero'): void {
  if (registered) return

  const root = document.querySelector<HTMLElement>(rootSelector)
  if (!root) return

  const svg = root.querySelector<SVGElement>('[data-flor-bloom-root]')
  if (!svg) return

  const all = getPetals(svg)
  if (!all.length) return

  // Reduced-motion: estado final inmediato, sin ScrollTrigger
  if (prefersReducedMotion()) {
    gsap.set(all, { opacity: 1 })
    return
  }

  // Estado inicial (refuerza inline SSR style="opacity:0")
  gsap.set(all, { opacity: 0 })

  mm = gsap.matchMedia()

  mm.add('(min-width: 768px)', () => {
    const n = all.length
    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate(self) {
        if (prefersReducedMotion()) return
        const progress = self.progress
        for (let i = 0; i < n; i++) {
          const start = i / n
          const end = (i + 1) / n + 0.1
          const p = Math.min(1, Math.max(0, (progress - start) / (end - start)))
          gsap.set(all[i]!, { opacity: p })
        }
      },
    })
    return () => {}
  })

  // Mobile: estado final estático sin scrub
  mm.add('(max-width: 767px)', () => {
    gsap.set(all, { opacity: 1 })
    return () => {}
  })

  registered = true
}

export function teardownFlorBloom(): void {
  mm?.revert()
  mm = null
  registered = false
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => teardownFlorBloom())
}
