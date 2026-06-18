/**
 * runtime-env.ts — lectura de variables sensibles en RUNTIME (no build-time)
 *
 * PROBLEMA: `import.meta.env.X` lo INLINEA Vite en build-time. Si la variable
 * no existe al construir (CI, build sin secretos) o cambia en el servidor de
 * produccion, el valor inlineado queda congelado o vacio y el endpoint deja de
 * funcionar sin un rebuild. Las claves sensibles (API keys, SMTP) deben venir
 * del entorno del PROCESO en produccion.
 *
 * SOLUCION: leer SIEMPRE de `process.env` en tiempo de ejecucion. Caemos a
 * `import.meta.env` solo como respaldo para el dev server de Astro (donde Vite
 * carga el .env y `process.env` puede no tener la variable). Asi:
 *   - Produccion (Node SSR): toma el valor del entorno real del servidor, sin
 *     rebuild. Cambiar la clave = reiniciar, no reconstruir.
 *   - Desarrollo (astro dev): si no esta en process.env, usa el .env de Vite.
 *
 * SERVER-ONLY: solo debe importarse desde rutas SSR (prerender = false) o
 * modulos de servidor (send.ts). Nunca desde codigo de cliente.
 */

/**
 * Devuelve el valor de una variable de entorno leida en runtime.
 *
 * Orden de preferencia:
 *   1. process.env[key]            (entorno real del proceso, produccion)
 *   2. import.meta.env[key]        (respaldo del dev server de Vite/Astro)
 *
 * Devuelve undefined si no esta definida en ninguno de los dos, o si esta
 * vacia tras recortar espacios (una clave vacia es lo mismo que no tenerla).
 */
export function runtimeEnv(key: string): string | undefined {
  // process.env: fuente de verdad en runtime (Node SSR en produccion).
  const fromProcess =
    typeof process !== 'undefined' && process.env ? process.env[key] : undefined
  if (typeof fromProcess === 'string' && fromProcess.trim() !== '') {
    return fromProcess
  }

  // Respaldo para el dev server: Vite carga el .env en import.meta.env.
  // En produccion esto suele estar inlineado o vacio; por eso va segundo.
  const meta = import.meta.env as Record<string, string | undefined>
  const fromMeta = meta[key]
  if (typeof fromMeta === 'string' && fromMeta.trim() !== '') {
    return fromMeta
  }

  return undefined
}
