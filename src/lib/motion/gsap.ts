/**
 * gsap.ts — registro de GSAP + ScrollTrigger + scrollerProxy para Lenis
 *
 * ADR-002: NO usar <ClientRouter /> — sin workarounds extra.
 * ADR-003: Solo GSAP free-tier (ScrollTrigger). Sin Club plugins (DrawSVG, SplitText).
 * ADR-004: Hero sin pin:true — continuation via scrub sin congelar viewport.
 *
 * Patrón: registerGsap() es idempotente (guard `registered`).
 * Llamar desde motion-bootstrap.ts después de initLenis().
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from './lenis'

let registered = false

export function registerGsap(): void {
  if (registered) return

  gsap.registerPlugin(ScrollTrigger)

  const lenis = getLenis()
  if (lenis) {
    // Sincronizar ScrollTrigger con el scroll de Lenis
    lenis.on('scroll', ScrollTrigger.update)

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.actualScroll
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }
      },
    })

    ScrollTrigger.defaults({ scroller: document.documentElement })
  }

  ScrollTrigger.config({ ignoreMobileResize: true })

  // Refresh tras primer frame de Lenis
  ScrollTrigger.refresh()

  registered = true
}

export function resetGsap(): void {
  registered = false
}

export { gsap, ScrollTrigger }
