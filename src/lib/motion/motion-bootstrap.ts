/**
 * motion-bootstrap.ts — orquestador global del sistema de motion
 *
 * Este módulo se importa como <script> en Base.astro.
 * Ejecuta el boot del motion system con dos capas defensivas:
 *
 *   1. JS: no inicializa nada si prefers-reduced-motion: reduce.
 *   2. CSS (motion.css): colapsa animaciones a 0.01ms como safety net.
 *
 * Sin <ClientRouter />: cada navegación es full reload, el bootstrap
 * corre exactamente una vez por página sin event listeners adicionales.
 * Si en el futuro se añade ClientRouter, añadir re-init en 'astro:page-load'.
 *
 * ADR-001: Lenis singleton en script global, no en React island.
 * ADR-002: Sin ClientRouter en v1.
 */

import { initLenis } from './lenis'
import { registerGsap, resetGsap } from './gsap'

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (reduce) {
  // Marcar el documento para que los helpers JS lean el flag
  document.documentElement.dataset.motion = 'reduced'
  // No inicializar Lenis ni GSAP — scroll nativo y estados finales directos
} else {
  document.documentElement.dataset.motion = 'full'
  initLenis()
  registerGsap()
}

// Re-init en astro:page-load (futura navegación SPA si se introduce ClientRouter)
// Por ahora sin-op en v1 (cada page es full reload). Documentado para PR futuro.
document.addEventListener('astro:page-load', () => {
  if (!reduce) {
    // En full reload esto no se dispara — pero si se añade ClientRouter:
    // destroyLenis() + resetGsap() + initLenis() + registerGsap()
    resetGsap()
    registerGsap()
  }
})
