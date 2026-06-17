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

// ─── Exportaciones de apoyo para Companion.tsx ────────────────────────────────

/** Re-exporta las constantes que Companion.tsx necesita para los selects. */
export const SECTOR_OPTIONS = SECTORS.map((o) => o.value)
export const PAIN_OPTIONS = PAINS.map((o) => o.value)
export const URGENCY_OPTIONS = URGENCIES
export { SECTOR_FALLBACK, PAIN_FALLBACK }

// v2 (fuera de alcance):
// export const llmInferencer: Inferencer = { ... }
