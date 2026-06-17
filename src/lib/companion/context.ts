/**
 * context.ts — persistencia del contexto del Companion entre paginas
 *
 * Almacenamiento en sessionStorage bajo la clave `zx.companion.v1`.
 * La sesion muere al cerrar la pestana: menor superficie RGPD, coherente
 * con "nada se envia hasta que tu lo decides" (DESIGN.md v2, decision
 * "persistencia de contexto entre paginas").
 *
 * Regla critica: writeContext() se llama SOLO tras accion explicita del
 * visitante (cuando pasa a estado 'result'). No se escribe nada en idle
 * ni en thinking.
 *
 * SSR-safe: las funciones comprueban typeof window antes de acceder a
 * sessionStorage para no romper el build de Astro en Node.
 */

export interface CompanionContext {
  sector: string
  pain: string
  urgency: string
  /** Texto libre original que escribio el visitante. */
  raw?: string
}

const STORAGE_KEY = 'zx.companion.v1'

/**
 * Lee el contexto guardado. Devuelve null si no hay nada o si el JSON
 * esta corrupto.
 */
export function readContext(): CompanionContext | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CompanionContext
  } catch {
    return null
  }
}

/**
 * Persiste el contexto. Solo debe llamarse tras accion explicita del
 * visitante (submit que lleva al estado 'result').
 */
export function writeContext(c: CompanionContext): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c))
  } catch {
    // sessionStorage puede estar bloqueado (private browsing restrictivo).
    // El Companion sigue funcionando en memoria; solo pierde la persistencia cross-page.
  }
}

/**
 * Borra el contexto guardado (reset del Companion o cierre explicito).
 */
export function clearContext(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Idem — no fatal.
  }
}
