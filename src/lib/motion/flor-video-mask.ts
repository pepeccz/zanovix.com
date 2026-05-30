/**
 * flor-video-mask.ts — interludio video con máscara flor que crece scroll-driven
 *
 * Trigger: [data-chapter="video-mask"]
 * Animación: CSS custom property --mask-sz de 120px → 100vmax y vuelta.
 * Sin pin GSAP. Sticky CSS en el stage (ADR-014).
 *
 * ADR-015: --mask-sz es la interfaz entre GSAP y el motor CSS.
 * ADR-009: matchMedia desktop (768px+) / mobile sin scrub.
 *
 * NOTA (riesgo #11 del design): gsap.fromTo con mixed units (px vs vmax) en
 * scrub bidireccional puede no normalizar bien el reverse. Se usa onUpdate
 * manual con style.setProperty para control explícito del valor interpolado.
 * El valor se interpola como: lerp(120, viewport_max * 100, progress) donde
 * viewport_max es Math.max(vw, vh) para emular vmax.
 *
 * SYNC: usa /isotipo-mask.svg como máscara (ADR-015). Sin modificaciones
 * a este módulo al reemplazar el placeholder por <video> real (REQ-7.2).
 */

import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './animations'

const MASK_MIN_PX = 120

let registered = false
let mm: ReturnType<typeof gsap.matchMedia> | null = null

function getVmax(): number {
  return Math.max(window.innerWidth, window.innerHeight)
}

export function registerFlorVideoMask(rootSelector = '[data-chapter="video-mask"]'): void {
  if (registered) return

  const root = document.querySelector<HTMLElement>(rootSelector)
  if (!root) return

  const stage = root.querySelector<HTMLElement>('[data-video-stage]')
  if (!stage) return

  // Fallback: si el browser no soporta mask-image, video full-size sin mask
  const supportsMask =
    typeof CSS !== 'undefined' &&
    (CSS.supports('mask-image', 'url(/isotipo-mask.svg)') ||
      CSS.supports('-webkit-mask-image', 'url(/isotipo-mask.svg)'))

  if (!supportsMask) {
    stage.style.setProperty('--mask-sz', '100vmax')
    registered = true
    return
  }

  // Reduced-motion: full-size sin animación
  if (prefersReducedMotion()) {
    stage.style.setProperty('--mask-sz', '100vmax')
    registered = true
    return
  }

  mm = gsap.matchMedia()

  mm.add('(min-width: 768px)', () => {
    // onUpdate manual: interpolación lineal px → 100vmax
    // Bidireccional garantizado: progress 0→1 expande, 1→0 contrae.
    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate(self) {
        if (prefersReducedMotion()) return
        const maxPx = getVmax()
        const value = MASK_MIN_PX + self.progress * (maxPx - MASK_MIN_PX)
        stage.style.setProperty('--mask-sz', `${Math.round(value)}px`)
      },
    })
    return () => {}
  })

  // Mobile: full-size estático sin scrub
  mm.add('(max-width: 767px)', () => {
    stage.style.setProperty('--mask-sz', '100vmax')
    return () => {}
  })

  registered = true
}

export function teardownFlorVideoMask(): void {
  mm?.revert()
  mm = null
  registered = false
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => teardownFlorVideoMask())
}
