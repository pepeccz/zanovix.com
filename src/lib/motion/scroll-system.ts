/**
 * scroll-system.ts — orquestador de scroll motion para la home
 *
 * Registra tres patrones de scrub sobre los 7 capítulos:
 *   - Cap 2: word-by-word reveal con pin + scrub (desktop) / fade-in stagger (mobile)
 *   - Cap 4: counter 0 → 80.000 con scrub (desktop) / estático (mobile)
 *   - Cap 4: palette inversion via toggle de clase .section--inverted
 *
 * Importado desde motion-bootstrap.ts tras document.fonts.ready.
 *
 * RISK GUARD 2.1 — resultado del smoke test en /dev/primitives:
 *   TODO: Documentar aquí el resultado tras validar en Chrome DevTools:
 *   ✅ pin:true funciona con Lenis proxy | ⚠️ Requiere pinType:'transform' | ❌ Sin pin
 *   Hasta tener el resultado, Cap 2 usa pin:true (valor por defecto del diseño).
 *   Si el smoke muestra desplazamiento incorrecto del contenido pineado,
 *   cambiar a pinType: 'transform' en registerCap2WordByWord().
 *
 * ADR-007: Todos los registros tienen guard prefersReducedMotion().
 * ADR-008: Palette inversion vía toggle de clase, no scrub (sin repaints por frame).
 * ADR-009: gsap.matchMedia() desktop (768px+) / mobile fallback.
 * ADR-011: Llamado desde motion-bootstrap.ts post document.fonts.ready.
 */

import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion, splitWords, revealStagger } from './animations'

// ─── Estado del módulo ────────────────────────────────────────────────────────

let registered = false
let mm: ReturnType<typeof gsap.matchMedia> | null = null

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Entrada única. Registra todos los scroll triggers.
 * Idempotente: segunda llamada es no-op.
 * Llamar desde motion-bootstrap.ts después de document.fonts.ready.
 */
export function registerScrollSystem(): void {
  if (registered) return

  mm = gsap.matchMedia()

  // Desktop: pin + scrub narrativo
  mm.add('(min-width: 768px)', () => {
    registerCap2WordByWord()
    registerCap4Counter()
    registerCap4PaletteInversion()
    return () => { /* GSAP autorrecicla los triggers dentro del matchMedia */ }
  })

  // Mobile: fade-in stagger sin pin
  mm.add('(max-width: 767px)', () => {
    registerCap2WordByWord_mobile()
    // Cap 4 counter: estático
    applyCounterFinalState()
    // Palette inversion: mismo toggle funciona en mobile
    registerCap4PaletteInversion()
    return () => {}
  })

  registered = true
}

/**
 * Desmonta todos los triggers del sistema.
 * Usado en HMR (Vite) para evitar ScrollTriggers duplicados en re-evaluación.
 */
export function teardownScrollSystem(): void {
  mm?.revert()
  mm = null
  registered = false
}

// ─── Registros por capítulo ───────────────────────────────────────────────────

/**
 * Cap 2 — word-by-word reveal (desktop): pin + scrub.
 * Busca [data-chapter="2"] → [data-role="declaration-text"] → splitWords.
 * Estado inicial: opacity 0.18, y 8px. Cada palabra se ilumina en su ventana.
 *
 * NOTA: si el smoke 2.1 muestra bug con Lenis + pin:true,
 * añadir pinType: 'transform' al ScrollTrigger.create().
 */
export function registerCap2WordByWord(
  rootSelector = '[data-chapter="2"]'
): ScrollTrigger | null {
  const root = document.querySelector<HTMLElement>(rootSelector)
  if (!root) return null

  const target = root.querySelector<HTMLElement>('[data-role="declaration-text"]')
  if (!target) return null

  if (prefersReducedMotion()) {
    const words = splitWords(target)
    if (words.length) gsap.set(words, { opacity: 1, y: 0 })
    return null
  }

  const words = splitWords(target)
  if (!words.length) return null

  // Estado inicial: casi invisible, ligeramente desplazado
  gsap.set(words, { opacity: 0.18, y: 8 })

  const n = words.length

  return ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: '+=200%',
    pin: true,
    // TODO: cambiar a pinType: 'transform' si smoke 2.1 confirma bug con Lenis
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate(self) {
      if (prefersReducedMotion()) return
      const progress = self.progress
      for (let i = 0; i < n; i++) {
        // Ventana de activación: [i/n, (i+1)/n + 0.05] con overlap suave
        const start = i / n
        const end = (i + 1) / n + 0.05
        const p = Math.min(1, Math.max(0, (progress - start) / (end - start)))
        gsap.set(words[i]!, { opacity: 0.18 + p * 0.82, y: 8 - p * 8 })
      }
    },
  })
}

/**
 * Cap 2 — word-by-word reveal (mobile): fade-in stagger sin pin.
 * Reutiliza revealStagger() de animations.ts.
 */
function registerCap2WordByWord_mobile(
  rootSelector = '[data-chapter="2"]'
): void {
  const root = document.querySelector<HTMLElement>(rootSelector)
  if (!root) return

  const target = root.querySelector<HTMLElement>('[data-role="declaration-text"]')
  if (!target) return

  if (prefersReducedMotion()) {
    const words = splitWords(target)
    if (words.length) gsap.set(words, { opacity: 1, y: 0 })
    return
  }

  const words = splitWords(target)
  if (!words.length) return

  // Añadir clase reveal para que el IntersectionObserver las active
  words.forEach(w => w.classList.add('reveal'))

  revealStagger(words as HTMLElement[], { stagger: 50 })
}

/**
 * Cap 4 — counter 0 → 80.000 con scrub (desktop).
 * Busca [data-chapter="4"] [data-role="counter"].
 * Formato es-ES con punto de miles.
 */
export function registerCap4Counter(
  rootSelector = '[data-chapter="4"]',
  target = 80_000
): ScrollTrigger | null {
  const root = document.querySelector<HTMLElement>(rootSelector)
  if (!root) return null

  const counterEl = root.querySelector<HTMLElement>('[data-role="counter"]')
  if (!counterEl) return null

  if (prefersReducedMotion()) {
    counterEl.textContent = target.toLocaleString('es-ES')
    return null
  }

  // Estado inicial
  counterEl.textContent = '0'

  return ScrollTrigger.create({
    trigger: root,
    start: 'top 70%',
    end: 'bottom 30%',
    scrub: 0.4,
    invalidateOnRefresh: true,
    onUpdate(self) {
      if (prefersReducedMotion()) return
      counterEl.textContent = Math.round(self.progress * target).toLocaleString('es-ES')
    },
  })
}

/**
 * Cap 4 — palette inversion via toggle de clase .section--inverted.
 * Sin scrub, sin pin (ADR-008). Solo callbacks toggle.
 * Funciona igual en desktop y mobile.
 */
export function registerCap4PaletteInversion(
  rootSelector = '[data-chapter="4"]'
): ScrollTrigger | null {
  const root = document.querySelector<HTMLElement>(rootSelector)
  if (!root) return null

  if (prefersReducedMotion()) {
    // En RM: aplicar clase directamente, sin transición (CSS la colapsa a 0.01ms)
    root.classList.add('section--inverted')
    return null
  }

  const add = () => root.classList.add('section--inverted')
  const remove = () => root.classList.remove('section--inverted')

  return ScrollTrigger.create({
    trigger: root,
    start: 'top 70%',
    end: 'bottom 30%',
    invalidateOnRefresh: true,
    onEnter: add,
    onEnterBack: add,
    onLeave: remove,
    onLeaveBack: remove,
  })
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

/** Aplica estado final del counter sin ScrollTrigger (mobile / reduced-motion). */
function applyCounterFinalState(
  rootSelector = '[data-chapter="4"]',
  target = 80_000
): void {
  const root = document.querySelector<HTMLElement>(rootSelector)
  if (!root) return
  const counterEl = root.querySelector<HTMLElement>('[data-role="counter"]')
  if (counterEl) counterEl.textContent = target.toLocaleString('es-ES')
}

// ─── HMR cleanup ─────────────────────────────────────────────────────────────

if (import.meta.hot) {
  import.meta.hot.dispose(() => teardownScrollSystem())
}
