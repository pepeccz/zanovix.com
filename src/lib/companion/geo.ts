/**
 * geo.ts — contrato y prompt de la radiografia GEO (server + cliente)
 *
 * GEO = Generative Engine Optimization. La radiografia es una DEMOSTRACION
 * HONESTA: le preguntamos a un modelo de IA que sabe HOY de un negocio
 * concreto (el que describe el visitante) y si lo recomendaria cuando
 * alguien busca su categoria en su zona.
 *
 * EL PRODUCTO ES LA HONESTIDAD. Reglas duras codificadas en el prompt:
 *   - Usamos la RESPUESTA REAL del modelo. No fabricamos nada.
 *   - El prompt PROHIBE inventar datos, competidores por nombre, metricas
 *     o rankings. Si el modelo no conoce el negocio (lo normal en una pyme
 *     no indexada), ESE es el resultado honesto y el momento de venta.
 *   - Refleja el CONOCIMIENTO del modelo (su entrenamiento), no una
 *     auditoria en vivo de la web ni un crawler. El aviso lo deja claro.
 *
 * Este modulo define el tipo de resultado, los limites de entrada y el
 * constructor del prompt. Lo importan el endpoint (server) y el servicio
 * de cliente (que solo usa los tipos y los limites, nunca llama al modelo).
 */

import type { CompanionContext } from './context'

// ─── Modelo (centralizado, un solo punto de cambio) ─────────────────────────

/**
 * Slug del modelo en OpenRouter.
 *
 * VERIFICADO contra el catalogo de OpenRouter (GET /api/v1/models) el
 * 2026-06-17: "anthropic/claude-haiku-4.5" existe y es de los mas
 * economicos de la familia Claude (prompt ~$0.000001/token, completion
 * ~$0.000005/token), adecuado para una demo publica acotada en coste.
 * Si se quiere mas calidad a mas coste, "anthropic/claude-sonnet-4.5"
 * tambien esta disponible. Cambiar el modelo = cambiar solo esta constante.
 */
export const GEO_MODEL_ID = 'anthropic/claude-haiku-4.5'

// ─── Limites anti-abuso ─────────────────────────────────────────────────────

/** Longitud maxima del texto del negocio que aceptamos (anti-abuso/coste). */
export const GEO_INPUT_MAX = 600

/** Longitud maxima de los campos opcionales (sector/zona). */
export const GEO_FIELD_MAX = 80

/** Tope de tokens de la respuesta del modelo (acota coste y verbosidad). */
export const GEO_MAX_TOKENS = 600

/** Timeout de la llamada al modelo (ms). Pasado esto, degradamos honesto. */
export const GEO_TIMEOUT_MS = 15_000

// ─── Tipos de entrada / salida ──────────────────────────────────────────────

/** Lo que el visitante aporta para la radiografia. */
export interface GeoInput {
  /** Descripcion libre del negocio (obligatoria). */
  description: string
  /** Sector/categoria, opcional (si el companion ya lo infirio). */
  sector?: string
  /** Zona/ciudad, opcional. */
  zone?: string
}

/**
 * Resultado de la radiografia. `known` resume si el modelo reconoce el
 * negocio concreto; los campos de texto son la respuesta REAL del modelo,
 * acotada por el prompt a frases breves y honestas.
 */
export interface GeoSnapshot {
  /** ¿El modelo reconoce este negocio concreto? (true / false / no claro) */
  known: 'yes' | 'no' | 'unclear'
  /** Como describiria una IA este negocio/categoria hoy (texto del modelo). */
  describes: string
  /** ¿Lo mencionaria/recomendaria al buscar [categoria] en [zona]? Por que. */
  recommend: string
  /** Que le falta para que una IA lo recomiende (acciones honestas). */
  gap: string
}

/**
 * Estado completo que el cliente maneja. Reutiliza CompanionContext para no
 * romper la superficie existente y le adjunta la radiografia + procedencia.
 */
export interface GeoResult {
  context: CompanionContext
  snapshot: GeoSnapshot | null
  /**
   * Origen del resultado:
   *   - 'live'      : respuesta REAL del modelo via OpenRouter.
   *   - 'fallback'  : sin clave o error/timeout; se uso el modo determinista
   *                   v1 (reglas) con aviso honesto. snapshot = null.
   */
  source: 'live' | 'fallback'
  /** Aviso honesto a mostrar cuando source = 'fallback'. */
  fallbackNotice?: string
}

// ─── Saneado de entrada ─────────────────────────────────────────────────────

/** Recorta y limpia la entrada del visitante a los limites permitidos. */
export function sanitizeGeoInput(raw: Partial<GeoInput>): GeoInput {
  const clip = (v: unknown, max: number) =>
    String(v ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, max)
  return {
    description: clip(raw.description, GEO_INPUT_MAX),
    sector: clip(raw.sector, GEO_FIELD_MAX) || undefined,
    zone: clip(raw.zone, GEO_FIELD_MAX) || undefined,
  }
}

// ─── Prompt ─────────────────────────────────────────────────────────────────

/**
 * System prompt: define el rol, el idioma, la voz anti-hype y, sobre todo,
 * las prohibiciones de honestidad. Pide salida JSON estricta para poder
 * parsearla sin alucinacion de formato.
 */
export const GEO_SYSTEM_PROMPT = [
  'Eres un evaluador honesto de visibilidad en asistentes de IA (GEO) para Zanovix.',
  'Tu unica fuente es lo que TU sabes por tu entrenamiento. NO navegas, NO accedes a la web en vivo, NO consultas datos externos.',
  '',
  'Reglas innegociables:',
  '1. Si NO conoces el negocio concreto que te describen (lo normal en una pyme local no indexada), dilo con total claridad. No es un fallo: es el dato honesto y el mas valioso.',
  '2. PROHIBIDO inventar: nada de competidores por su nombre, ni datos, cifras, premios, reseñas, ubicaciones exactas o rankings que no conozcas con certeza. Ante la duda, di que no lo sabes.',
  '3. PROHIBIDO prometer posiciones ("seras el numero 1 en ChatGPT" no existe). Habla de probabilidad de ser mencionado, no de rankings.',
  '4. Habla en castellano de España, trato de tu, sin tecnicismos, sin marketing hueco (nada de "transformacion digital", "disruptivo", "10x", "potenciar", "revolucionar"). Sin guiones largos.',
  '5. Se breve y concreto. Frases cortas. Sin relleno.',
  '',
  'Devuelve UNICAMENTE un objeto JSON valido, sin texto antes ni despues, con esta forma exacta:',
  '{',
  '  "known": "yes" | "no" | "unclear",',
  '  "describes": "1-2 frases: como describiria una IA este negocio o su categoria hoy, con lo que de verdad sabes.",',
  '  "recommend": "1-2 frases: si alguien preguntara por esta categoria en esta zona, lo mencionarias o nombrarias a otros, y por que. Sin inventar nombres.",',
  '  "gap": "1-2 frases: que le falta a este negocio para que una IA lo conozca y lo recomiende. Acciones honestas, no promesas."',
  '}',
  '"known" = "no" cuando no reconoces el negocio concreto; "unclear" si solo conoces la categoria general pero no el negocio; "yes" solo si reconoces el negocio especifico.',
].join('\n')

/** Construye el mensaje de usuario con el negocio concreto del visitante. */
export function buildGeoUserPrompt(input: GeoInput): string {
  const lines = [`Negocio (en palabras del propio dueño): ${input.description}`]
  if (input.sector) lines.push(`Categoria/sector: ${input.sector}`)
  if (input.zone) lines.push(`Zona: ${input.zone}`)
  lines.push(
    '',
    'Responde solo con el JSON pedido. Recuerda: si no conoces este negocio concreto, "known" debe ser "no" y debes decirlo sin rodeos.',
  )
  return lines.join('\n')
}
