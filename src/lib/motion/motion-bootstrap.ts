/**
 * motion-bootstrap.ts — arranque global del sistema de motion
 *
 * Importado como <script> en Base.astro. Inicializa Lenis (smooth scroll)
 * con dos capas defensivas:
 *
 *   1. JS: no inicializa nada si prefers-reduced-motion: reduce.
 *   2. CSS (motion.css): colapsa animaciones a 0.01ms como safety net.
 *
 * v2: sin capítulos editoriales ni scroll secuestrado. Solo scroll suave
 * global. Los reveals de secciones corren via IntersectionObserver en
 * la isla Reveal (0KB de JS extra).
 *
 * ADR-001: Lenis singleton en script global, no en React island.
 * ADR-002: Sin ClientRouter en v1 (Lenis gana sobre View Transitions).
 */

import { initLenis, destroyLenis } from './lenis'

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (reduce) {
  // Marcar el documento para que los helpers JS lean el flag
  document.documentElement.dataset.motion = 'reduced'
  // No inicializar Lenis — scroll nativo
} else {
  document.documentElement.dataset.motion = 'full'
  initLenis()
}

/**
 * Re-init en astro:page-load.
 *
 * En v1 (sin ClientRouter) esto NUNCA se dispara — cada navegacion es full
 * reload del documento. Queda registrado de forma defensiva para cuando se
 * introduzca ClientRouter.
 */
document.addEventListener('astro:page-load', () => {
  if (reduce) return
  destroyLenis()
  initLenis()
})
