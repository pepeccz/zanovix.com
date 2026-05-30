/**
 * motion-bootstrap.ts — orquestador global del sistema de motion
 *
 * Importado como <script> en Base.astro. Boot del motion system con dos
 * capas defensivas:
 *
 *   1. JS: no inicializa nada si prefers-reduced-motion: reduce.
 *   2. CSS (motion.css): colapsa animaciones a 0.01ms como safety net.
 *
 * v1: sin <ClientRouter />. Cada navegación es full reload, el bootstrap
 * corre una vez por página. El listener `astro:page-load` queda registrado
 * de todas formas — si en el futuro se introduce ClientRouter sin tocar
 * este archivo, Lenis y GSAP se reciclan limpios entre transiciones.
 *
 * ADR-001: Lenis singleton en script global, no en React island.
 * ADR-002: Sin ClientRouter en v1 (Lenis gana sobre View Transitions).
 * ADR-011: registerScrollSystem() llamado tras document.fonts.ready para
 *          garantizar coordenadas estables de ScrollTrigger post-font-swap.
 */

import { initLenis, destroyLenis } from './lenis'
import { registerGsap, resetGsap, ScrollTrigger } from './gsap'
import { registerScrollSystem, teardownScrollSystem } from './scroll-system'

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (reduce) {
  // Marcar el documento para que los helpers JS lean el flag
  document.documentElement.dataset.motion = 'reduced'
  // No inicializar Lenis ni GSAP — scroll nativo y estados finales directos
} else {
  document.documentElement.dataset.motion = 'full'
  initLenis()
  registerGsap()

  // ADR-011: esperar a que las fuentes estén listas antes de registrar
  // scroll-system — garantiza que la altura tipográfica del H1 (Cormorant)
  // ya está calculada y los triggers no apuntan a coordenadas invalidadas.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      registerScrollSystem()
      ScrollTrigger.refresh()
    })
  } else {
    // Fallback para browsers sin document.fonts (edge case)
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        registerScrollSystem()
        ScrollTrigger.refresh()
      })
    } else {
      setTimeout(() => {
        registerScrollSystem()
        ScrollTrigger.refresh()
      }, 0)
    }
  }
}

/**
 * Re-init en astro:page-load.
 *
 * En v1 (sin ClientRouter) esto NUNCA se dispara — cada navegación es full
 * reload del documento. Queda registrado de forma defensiva: si más adelante
 * se introduce `<ClientRouter />` para View Transitions cross-page, Lenis +
 * GSAP se reciclan limpios y el motion sigue funcionando sin tocar este file.
 *
 * Sin destroyLenis(): la siguiente initLenis() devolvería la misma instancia
 * por el guard `if (instance) return instance`. Por eso destruimos primero.
 */
document.addEventListener('astro:page-load', () => {
  if (reduce) return
  destroyLenis()
  resetGsap()
  teardownScrollSystem()
  initLenis()
  registerGsap()

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      registerScrollSystem()
      ScrollTrigger.refresh()
    })
  } else {
    setTimeout(() => {
      registerScrollSystem()
      ScrollTrigger.refresh()
    }, 0)
  }
})
