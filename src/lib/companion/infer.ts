/**
 * infer.ts — inferencia determinista del Companion (v1)
 *
 * Expone la interfaz `Inferencer` con contrato async para que el swap
 * a LLM v2 sea transparente (DESIGN.md v2, decision "contrato estable
 * para swap a LLM v2"). La UI ya maneja la fase "thinking", por lo que
 * no requiere cambios cuando se active el inferencer de red.
 *
 * v1 = rulesInferencer: reglas deterministas locales, sin red.
 * v2 (fuera de alcance) = llmInferencer: mismo contrato, fetch a endpoint.
 */

import type { CompanionContext } from './context'
import type { GeoResult, GeoSnapshot } from './geo'

// ─── Contrato publico ─────────────────────────────────────────────────────────

/**
 * Contrato de inferencia. Toda implementacion recibe el texto libre del
 * visitante y, opcionalmente, el contexto previo acumulado entre paginas.
 * Devuelve una Promise para que el swap a red sea transparente.
 */
export interface Inferencer {
  infer(text: string, prev?: CompanionContext): Promise<CompanionContext>
}

// ─── Tablas de opciones ───────────────────────────────────────────────────────

interface Option {
  value: string
  /** Palabras clave que disparan esta opcion al inferir. */
  match: string[]
}

const SECTORS: Option[] = [
  { value: 'Hosteleria y restauracion', match: ['restaurante', 'hostele', 'bar', 'cocina', 'menu', 'reservas', 'cafeteria', 'hotel'] },
  { value: 'Comercio y eCommerce', match: ['tienda', 'ecommerce', 'venta', 'producto', 'envio', 'comercio', 'pedidos'] },
  { value: 'Salud y clinicas', match: ['clinica', 'dentista', 'salud', 'paciente', 'medic', 'fisio', 'consulta'] },
  { value: 'Servicios profesionales', match: ['abogad', 'despacho', 'legal', 'asesor', 'gestor', 'consultor', 'arquitect'] },
  { value: 'Inmobiliario', match: ['inmobiliar', 'piso', 'alquiler', 'vivienda', 'propiedad', 'finca'] },
  { value: 'Industria y talleres', match: ['fabrica', 'industri', 'taller', 'produccion', 'almacen', 'logistica'] },
  { value: 'Tecnologia y software', match: ['software', 'app', 'saas', 'tecnolog', 'desarrollo', 'plataforma'] },
  { value: 'Formacion y educacion', match: ['academia', 'formacion', 'curso', 'escuela', 'educa', 'clases'] },
]

const PAINS: Option[] = [
  { value: 'No te encuentran cuando preguntan a una IA', match: ['google', 'chatgpt', 'aparec', 'encuentr', 'buscan', 'web', 'seo', 'visib', 'online', 'internet', 'posiciona'] },
  { value: 'Respondes lo mismo una y otra vez', match: ['responder', 'atender', 'mensaje', 'whatsapp', 'correo', 'duda', 'pregunta', 'mismo', 'repetir', 'soporte'] },
  { value: 'Procesos manuales que comen horas', match: ['excel', 'hoja', 'manual', 'papel', 'gestion', 'administra', 'factura', 'datos', 'tarea'] },
  { value: 'Quieres usar IA pero no sabes por donde', match: ['ia', 'inteligencia', 'automatiza', 'empezar', 'no se', 'no sabemos', 'perdid'] },
]

const SECTOR_FALLBACK = 'Aun lo estoy situando'
const PAIN_FALLBACK = 'Quieres usar IA pero no sabes por donde'

const URGENCIES = ['Lo estoy explorando', 'Me corre algo de prisa', 'Es urgente, lo necesito ya']

// ─── Funciones de inferencia ──────────────────────────────────────────────────

function inferOption(text: string, options: Option[], fallback: string): string {
  const t = text.toLowerCase()
  for (const opt of options) {
    if (opt.match.some((m) => t.includes(m))) return opt.value
  }
  return fallback
}

function inferUrgency(text: string): string {
  const t = text.toLowerCase()
  if (/(urgent|ya|cuanto antes|inmediat|ayer)/.test(t)) return URGENCIES[2]!
  if (/(pronto|prisa|este mes|rapido)/.test(t)) return URGENCIES[1]!
  return URGENCIES[0]!
}

// ─── Implementacion v1 ────────────────────────────────────────────────────────

/**
 * Inferencer determinista v1. Sin red. Las reglas se aplican sobre el
 * texto en minusculas sin acentos para maximizar la cobertura de matches.
 *
 * El parametro `prev` permite acumular contexto entre paginas: si el
 * visitante ya tenia sector inferido y el nuevo texto no aporta senales
 * mas claras, se conserva el previo (comportamiento pendiente de afinar
 * segun feedback real; en v1 se sobreescribe siempre para mantenerlo simple).
 */
export const rulesInferencer: Inferencer = {
  infer(text: string, _prev?: CompanionContext): Promise<CompanionContext> {
    const result: CompanionContext = {
      sector: inferOption(text, SECTORS, SECTOR_FALLBACK),
      pain: inferOption(text, PAINS, PAIN_FALLBACK),
      urgency: inferUrgency(text),
      raw: text,
    }
    return Promise.resolve(result)
  },
}

// ─── v2: radiografia GEO en vivo (LLM real via endpoint) ──────────────────────

/**
 * geoInferencer — mismo contrato `Inferencer`, pero ademas de inferir por
 * reglas pide al endpoint /api/geo-snapshot una radiografia GEO REAL.
 *
 * Importante: el contrato `infer()` se MANTIENE (devuelve CompanionContext),
 * para no romper ningun consumidor existente. La radiografia (snapshot) se
 * obtiene aparte con `requestGeoSnapshot()`, que SOLO se llama tras el
 * CONSENTIMIENTO explicito del visitante (es lo unico que envia su texto a
 * un proveedor de IA externo). El contexto por reglas no sale del navegador.
 *
 * La superficie React no cambia: el companion sigue usando rulesInferencer
 * para el perfil editable; geoInferencer añade la capa GEO encima.
 */
export const geoInferencer: Inferencer = {
  // El perfil (sector/dolor/urgencia) se sigue infiriendo localmente.
  infer: rulesInferencer.infer,
}

/**
 * Pide la radiografia GEO al endpoint SSR. Esta es la UNICA funcion que
 * envia el texto del visitante a un proveedor externo (OpenRouter), y por
 * eso SOLO debe invocarse tras consentimiento explicito.
 *
 * Nunca lanza: ante cualquier fallo de red devuelve un GeoResult en modo
 * 'fallback' con aviso honesto, para que el companion degrade al perfil por
 * reglas sin romperse.
 */
export async function requestGeoSnapshot(
  text: string,
  ctx: CompanionContext,
): Promise<GeoResult> {
  const FALLBACK_NOTICE =
    'No he podido preguntarle en vivo a una IA, asi que te muestro lo que deduzco con reglas. Es una aproximacion mas simple.'

  try {
    const res = await fetch('/api/geo-snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: text,
        sector: ctx.sector !== SECTOR_FALLBACK ? ctx.sector : undefined,
      }),
    })

    if (!res.ok) {
      return { context: ctx, snapshot: null, source: 'fallback', fallbackNotice: FALLBACK_NOTICE }
    }

    const data = (await res.json()) as {
      source?: 'live' | 'fallback'
      snapshot?: GeoSnapshot | null
      fallbackNotice?: string
    }

    if (data.source === 'live' && data.snapshot) {
      return { context: ctx, snapshot: data.snapshot, source: 'live' }
    }

    return {
      context: ctx,
      snapshot: null,
      source: 'fallback',
      fallbackNotice: data.fallbackNotice || FALLBACK_NOTICE,
    }
  } catch {
    return { context: ctx, snapshot: null, source: 'fallback', fallbackNotice: FALLBACK_NOTICE }
  }
}

// ─── Exportaciones de apoyo para Companion.tsx ────────────────────────────────

/** Re-exporta las constantes que Companion.tsx necesita para los selects. */
export const SECTOR_OPTIONS = SECTORS.map((o) => o.value)
export const PAIN_OPTIONS = PAINS.map((o) => o.value)
export const URGENCY_OPTIONS = URGENCIES
export { SECTOR_FALLBACK, PAIN_FALLBACK }
