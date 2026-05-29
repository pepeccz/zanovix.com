/**
 * lenis.ts — singleton Lenis
 *
 * Reglas:
 * - Una sola instancia por página (no duplicados → no double-scroll).
 * - Respeta prefers-reduced-motion: si reduce, NO se inicializa.
 * - Expone window.__lenis para acceso desde otros scripts.
 * - Sin ClientRouter: cada navegación es full reload, el singleton se
 *   reconstruye naturalmente. Si en el futuro se añade ClientRouter,
 *   añadir destroyLenis() en 'astro:before-swap'.
 */

import Lenis from 'lenis'

declare global {
  interface Window {
    __lenis: Lenis | null
  }
}

let instance: Lenis | null = null

export function getLenis(): Lenis | null {
  return instance
}

export function initLenis(): Lenis | null {
  // Guard: prefers-reduced-motion → scroll nativo del browser
  if (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null
  }

  if (instance) return instance

  instance = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false, // touch nativo gana en mobile (lenis 1.x: syncTouch)
  })

  // RAF loop
  const raf = (time: number) => {
    instance!.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // Exponer globalmente para otros scripts
  window.__lenis = instance

  return instance
}

export function destroyLenis(): void {
  instance?.destroy()
  instance = null
  if (typeof window !== 'undefined') {
    window.__lenis = null
  }
}
