/**
 * sketch.ts — contrato y prompt del esbozo de automatizacion (server + cliente)
 *
 * El esbozo de automatizacion es una DEMOSTRACION HONESTA para el servicio de
 * software a medida. El visitante describe una tarea repetitiva que le come
 * tiempo y, tras un CONSENTIMIENTO explicito, le preguntamos en vivo a un
 * modelo de IA (via /api/automation-sketch) que parte se podria automatizar,
 * con que enfoque a grandes rasgos y con que avisos honestos.
 *
 * EL PRODUCTO ES LA HONESTIDAD. Reglas duras codificadas en el prompt:
 *   - Es un ESBOZO a partir de lo que cuenta el visitante, NO una propuesta,
 *     NO un presupuesto, NO un plan cerrado.
 *   - PROHIBIDO dar plazos, precios, cifras de ahorro o porcentajes. No los
 *     conocemos sin un discovery, e inventarlos seria mentir.
 *   - Si la tarea NO compensa automatizar o falta informacion, el modelo lo
 *     dice sin rodeos. Eso es honestidad, no un fallo de la demo.
 *   - Voz peninsular, trato de tu, anti-hype, sin guiones largos, breve.
 *
 * Este modulo define el tipo de resultado, los limites de entrada y el
 * constructor del prompt. Lo importan el endpoint (server) y la isla de
 * cliente (que solo usa los tipos y los limites, nunca llama al modelo).
 */

// ─── Modelo (centralizado, un solo punto de cambio) ─────────────────────────

/**
 * Slug del modelo en OpenRouter. Alineado con el resto de demos del sitio
 * (radiografia GEO, asistente): "anthropic/claude-haiku-4.5", de los mas
 * economicos de la familia Claude y adecuado para una demo publica acotada en
 * coste. Cambiar el modelo = cambiar solo esta constante.
 */
export const SKETCH_MODEL_ID = 'anthropic/claude-haiku-4.5'

// ─── Limites anti-abuso ─────────────────────────────────────────────────────

/** Longitud minima util de la tarea descrita para que el esbozo tenga sentido. */
export const SKETCH_INPUT_MIN = 12

/** Longitud maxima del texto de la tarea que aceptamos (anti-abuso/coste). */
export const SKETCH_INPUT_MAX = 600

/** Tope de tokens de la respuesta del modelo (acota coste y verbosidad). */
export const SKETCH_MAX_TOKENS = 700

/** Timeout de la llamada al modelo (ms). Pasado esto, degradamos honesto. */
export const SKETCH_TIMEOUT_MS = 18_000

// ─── Tipos de entrada / salida ──────────────────────────────────────────────

/** Lo que el visitante aporta para el esbozo. */
export interface SketchInput {
  /**
   * Descripcion libre de una tarea repetitiva que le come tiempo
   * (OBLIGATORIA). Es el unico eje del esbozo: sin tarea no hay nada que
   * esbozar.
   */
  task: string
}

/**
 * Resultado del esbozo. Los campos son la respuesta REAL del modelo, acotada
 * por el prompt a frases breves y honestas, sin plazos, precios ni cifras.
 */
export interface AutomationSketch {
  /**
   * Veredicto de fondo sobre si la tarea compensa automatizar:
   *   - 'yes'     : hay una parte clara que merece la pena automatizar.
   *   - 'partial' : parte si, parte no (lo mas comun y honesto).
   *   - 'no'      : tal y como la cuenta, no compensa o no es el momento.
   *   - 'unclear' : falta informacion para decir nada util todavia.
   */
  verdict: 'yes' | 'partial' | 'no' | 'unclear'
  /** Que parte se podria automatizar y que parte conviene dejar a una persona. */
  automatable: string
  /** Enfoque a grandes rasgos: pasos / que tipo de herramienta, sin tecnicismos. */
  approach: string
  /** Avisos honestos: limites, riesgos, lo que haria falta saber antes. */
  caveats: string
}

/** Origen del resultado que maneja el cliente. */
export interface SketchResult {
  sketch: AutomationSketch | null
  /**
   * - 'live'     : respuesta REAL del modelo via OpenRouter.
   * - 'fallback' : sin clave o error/timeout; no hay esbozo. sketch = null.
   */
  source: 'live' | 'fallback'
  /** Aviso honesto a mostrar cuando source = 'fallback'. */
  fallbackNotice?: string
}

// ─── Saneado de entrada ─────────────────────────────────────────────────────

/** Recorta y limpia la entrada del visitante a los limites permitidos. */
export function sanitizeSketchInput(raw: Partial<SketchInput>): SketchInput {
  const task = String(raw.task ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SKETCH_INPUT_MAX)
  return { task }
}

// ─── Prompt ─────────────────────────────────────────────────────────────────

/**
 * System prompt: define el rol, el idioma, la voz anti-hype y, sobre todo, las
 * prohibiciones de honestidad. Pide salida JSON estricta para parsearla sin
 * alucinacion de formato.
 */
export const SKETCH_SYSTEM_PROMPT = [
  'Eres un ingeniero honesto de Zanovix que ayuda a una pyme a entender, a grandes rasgos, que de una tarea repetitiva suya se podria automatizar y que no.',
  '',
  'Te dan la descripcion de UNA tarea que esa persona repite y que le come tiempo. Devuelves un ESBOZO orientativo a partir SOLO de lo que te cuenta. No tienes mas contexto que ese texto.',
  '',
  'Reglas innegociables:',
  '1. Es un ESBOZO, no una propuesta ni un presupuesto ni un plan cerrado. Habla en condicional ("se podria", "habria que mirar"), no como si fuera un compromiso.',
  '2. PROHIBIDO dar plazos, fechas, precios, presupuestos, horas de trabajo, cifras de ahorro, porcentajes o cualquier numero inventado. No los sabes sin un discovery; decirlos seria mentir. Ni siquiera des rangos.',
  '3. Si la tarea, tal y como la cuenta, NO compensa automatizar (es puntual, cambia mucho cada vez, necesita criterio humano, o el volumen es bajo), dilo claro: verdict "no" y explica por que con respeto.',
  '4. Si falta informacion para decir algo util, dilo: verdict "unclear" y apunta que harias falta saber. No rellenes con suposiciones.',
  '5. Distingue siempre que parte se puede automatizar y que parte conviene dejar a una persona. Casi nada se automatiza al 100%.',
  '6. Nada de promesas grandilocuentes ni marketing: prohibido "transformacion digital", "disruptivo", "10x", "potenciar", "revolucionar", "sin esfuerzo", "magia". Lenguaje llano, como se lo explicarias a quien no es tecnico.',
  '7. No te inventes integraciones ni nombres de productos concretos si no los menciona el usuario. Habla de "tipos de herramienta" (una hoja conectada, un pequeno programa, un conector entre tu correo y tu gestion), no de marcas.',
  '8. Castellano de España, trato de tu, frases cortas, sin relleno. Sin guiones largos.',
  '',
  'Devuelve UNICAMENTE un objeto JSON valido, sin texto antes ni despues, con esta forma exacta:',
  '{',
  '  "verdict": "yes" | "partial" | "no" | "unclear",',
  '  "automatable": "1-2 frases: que parte de la tarea se podria automatizar y que parte conviene que siga haciendo una persona. Si no compensa, dilo aqui.",',
  '  "approach": "2-3 frases: el enfoque a grandes rasgos, en pasos sencillos y sin tecnicismos (que tipo de herramienta, que haria por ti). Si verdict es no o unclear, di que harias falta aclarar en vez de inventar un enfoque.",',
  '  "caveats": "1-2 frases: avisos honestos. Limites, riesgos, o lo que habria que mirar en un discovery antes de prometer nada. Nunca plazos ni precios."',
  '}',
  '"verdict" = "yes" si hay una parte clara que merece la pena; "partial" si parte si y parte no (lo mas habitual); "no" si tal como la cuenta no compensa; "unclear" si falta informacion para decir nada util.',
].join('\n')

/** Construye el mensaje de usuario con la tarea concreta del visitante. */
export function buildSketchUserPrompt(input: SketchInput): string {
  return [
    'Tarea repetitiva que me come tiempo:',
    input.task,
    '',
    'Devuelve solo el JSON pedido. Recuerda: es un esbozo, sin plazos ni precios ni cifras. Si no compensa automatizarla o falta informacion, dilo sin rodeos.',
  ].join('\n')
}
