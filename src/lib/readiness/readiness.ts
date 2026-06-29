/**
 * readiness.ts — motor del autodiagnostico de AI Readiness (deterministico)
 *
 * EL PRODUCTO ES LA HONESTIDAD. Este modulo NO llama a ningun LLM: es un
 * conjunto de preguntas con opciones y un motor de reglas que lee las
 * respuestas y devuelve una lectura honesta. Cero coste, cero latencia, cero
 * alucinacion. Lo que dice se puede auditar leyendo este archivo.
 *
 * No es una auditoria real. Es una orientacion a partir de seis respuestas.
 * La auditoria de verdad va mas a fondo, con discovery. Eso se dice claro en
 * el resultado y en el encuadre del componente.
 *
 * El motor puede concluir que la IA NO es la prioridad ahora mismo: si el
 * negocio no tiene la base ordenada (datos en papel, sin presencia, sin
 * objetivo claro), lo honesto es decir "antes que IA, conviene ordenar X".
 * Eso es on-brand, no un fallo.
 *
 * Mapeo a servicios reales cuando procede: visibilidad en IA (cómo te ve una IA),
 * software a medida (automatizar tareas repetitivas), auditoria (cuando hay
 * varios frentes y conviene priorizar con cabeza).
 */

/** Una opcion de respuesta dentro de una pregunta. */
export interface ReadinessOption {
  /** Id estable, usado por el motor de reglas. */
  id: string
  /** Texto que ve el visitante. */
  label: string
}

/** Una pregunta del cuestionario. */
export interface ReadinessQuestion {
  /** Id estable de la pregunta (clave en el mapa de respuestas). */
  id: ReadinessKey
  /** Enunciado (legend del fieldset). */
  legend: string
  /** Ayuda corta opcional bajo el enunciado. */
  hint?: string
  options: ReadinessOption[]
}

/** Claves de las preguntas (tambien claves del objeto de respuestas). */
export type ReadinessKey =
  | 'sector'
  | 'datos'
  | 'dolor'
  | 'equipo'
  | 'probado'
  | 'objetivo'

/** Respuestas del visitante: clave de pregunta -> id de opcion elegida. */
export type ReadinessAnswers = Partial<Record<ReadinessKey, string>>

/** Servicio al que apunta la lectura (para el CTA y el correo). */
export type ReadinessService = 'geo' | 'software' | 'auditoria' | 'ninguno'

/**
 * Tono de la lectura. `base` = hay una base razonable y la IA puede aportar.
 * `cimientos` = primero hay que ordenar lo de debajo; la IA no es la prioridad.
 */
export type ReadinessTone = 'listo' | 'parcial' | 'cimientos'

/** Resultado que devuelve el motor. */
export interface ReadinessResult {
  tone: ReadinessTone
  /** Titular honesto del veredicto. */
  verdict: string
  /** Donde la IA te aporta hoy (puede ir vacio si toca ordenar antes). */
  aporta: string
  /** Donde la IA no te aporta todavia, dicho sin rodeos. */
  todavia: string
  /** Un primer paso concreto. */
  primerPaso: string
  /** Servicio recomendado, si procede. */
  service: ReadinessService
  /** Etiqueta corta del servicio para el CTA (vacia si service = ninguno). */
  serviceLabel: string
  /** Ruta del servicio recomendado (vacia si service = ninguno). */
  serviceHref: string
}

// ── Limites compartidos con el endpoint/cliente ───────────────────────────
export const READINESS_QUESTION_COUNT = 6

// ── Cuestionario ──────────────────────────────────────────────────────────
// Preguntas pensadas para DISCRIMINAR de verdad, no para halagar. Cada opcion
// mueve el diagnostico hacia una lectura distinta.
export const READINESS_QUESTIONS: ReadinessQuestion[] = [
  {
    id: 'sector',
    legend: '¿A qué se dedica tu negocio?',
    hint: 'Nos ayuda a poner la lectura en contexto.',
    options: [
      { id: 'local', label: 'Atiendo a clientes de mi zona (tienda, bar, clínica, taller)' },
      { id: 'servicios', label: 'Servicios profesionales (asesoría, despacho, agencia, consulta)' },
      { id: 'comercio', label: 'Vendo productos, en tienda o por internet' },
      { id: 'industria', label: 'Fabricación, logística u operaciones' },
      { id: 'otro', label: 'Otra cosa' },
    ],
  },
  {
    id: 'datos',
    legend: '¿Cómo llevas hoy la información y los procesos del día a día?',
    hint: 'Pedidos, clientes, citas, facturas, ese tipo de cosas.',
    options: [
      { id: 'papel', label: 'Sobre todo a mano: papel, cabeza, alguna libreta' },
      { id: 'excel', label: 'En hojas de cálculo y carpetas, cada cosa por su lado' },
      { id: 'herramientas', label: 'Con varias herramientas sueltas que no se hablan entre sí' },
      { id: 'integrado', label: 'Con un sistema más o menos integrado donde está casi todo' },
    ],
  },
  {
    id: 'dolor',
    legend: '¿Qué es lo que más te quema ahora mismo?',
    hint: 'Quédate con el que más duele, aunque haya varios.',
    options: [
      { id: 'visibilidad', label: 'No me encuentran: cuando buscan lo que hago, no aparezco' },
      { id: 'repetir', label: 'Respondo lo mismo decenas de veces al día (horarios, precios, citas)' },
      { id: 'manual', label: 'Tareas manuales que me comen horas (copiar datos, informes, pedidos)' },
      { id: 'ciegas', label: 'Decido a ciegas: tengo datos pero no sé qué me dicen' },
      { id: 'ninguno', label: 'No tengo un dolor claro, vengo a curiosear' },
    ],
  },
  {
    id: 'equipo',
    legend: '¿Con qué manos técnicas cuentas?',
    options: [
      { id: 'solo', label: 'Voy yo solo o casi, sin nadie técnico' },
      { id: 'apano', label: 'Alguien del equipo se apaña con la tecnología cuando hace falta' },
      { id: 'equipo', label: 'Tengo un pequeño equipo que se mueve bien con herramientas' },
      { id: 'it', label: 'Tenemos a alguien o algo dedicado a sistemas / IT' },
    ],
  },
  {
    id: 'probado',
    legend: '¿Qué has probado ya con IA?',
    options: [
      { id: 'nada', label: 'Nada todavía, estoy mirando' },
      { id: 'chatgpt', label: 'Uso ChatGPT o similar de vez en cuando, por mi cuenta' },
      { id: 'fallido', label: 'Probé alguna herramienta de IA pero no llegó a cuajar' },
      { id: 'produccion', label: 'Ya uso IA en algo del negocio de forma habitual' },
    ],
  },
  {
    id: 'objetivo',
    legend: '¿Qué te gustaría conseguir?',
    options: [
      { id: 'encontrar', label: 'Que me encuentren más, también cuando preguntan a una IA' },
      { id: 'tiempo', label: 'Quitarme de encima tareas repetitivas y ganar horas' },
      { id: 'entender', label: 'Entender mis datos para decidir mejor' },
      { id: 'noseque', label: 'No lo tengo claro, por eso estoy aquí' },
    ],
  },
]

// ── Catalogo de servicios (rutas reales en master) ────────────────────────
const SERVICE_META: Record<
  Exclude<ReadinessService, 'ninguno'>,
  { label: string; href: string }
> = {
  geo: { label: 'Ver tu visibilidad en IA', href: '/servicios/visibilidad-en-ia' },
  software: { label: 'Ver software a medida', href: '/servicios/software-a-medida' },
  auditoria: { label: 'Ver auditoría AI Readiness', href: '/servicios/auditoria-ai-readiness' },
}

/**
 * Indica si la BASE del negocio esta sin ordenar. Cuando es asi, lo honesto es
 * empezar por los cimientos, no por la IA.
 */
function baseSinOrdenar(a: ReadinessAnswers): boolean {
  // Todo a mano + sin manos tecnicas + sin haber tocado nada de IA: ahora
  // mismo la IA no es la palanca, ordenar lo de debajo lo es.
  return a.datos === 'papel' && a.equipo === 'solo' && a.probado === 'nada'
}

/** Indica si el visitante no trae ni dolor ni objetivo: viene a curiosear. */
function sinRumbo(a: ReadinessAnswers): boolean {
  return (a.dolor === 'ninguno' || !a.dolor) && (a.objetivo === 'noseque' || !a.objetivo)
}

/**
 * Motor de lectura. Reglas explicitas, en orden de prioridad. La primera regla
 * que case manda. Todo lo que dice es trazable aqui.
 */
export function readReadiness(a: ReadinessAnswers): ReadinessResult {
  const dolor = a.dolor
  const objetivo = a.objetivo

  // ── 1. Cimientos primero: la IA NO es la prioridad ahora ────────────────
  // Negocio a mano, sin manos tecnicas, sin haber probado nada, y ademas sin
  // un dolor ni objetivo claros. Decirlo es lo honesto.
  if (baseSinOrdenar(a) && sinRumbo(a)) {
    return {
      tone: 'cimientos',
      verdict: 'Por lo que cuentas, la IA no es tu prioridad ahora mismo.',
      aporta:
        'Hoy la IA te aportaría poco, y montarla sobre lo que hay sería gastar sin base. No pasa nada: casi nadie empieza por aquí.',
      todavia:
        'Llevas el negocio a mano y todavía no hay un sitio donde vivan tus datos. Sin eso ordenado, cualquier IA trabaja a ciegas y se nota.',
      primerPaso:
        'Antes que IA, conviene ordenar lo de debajo: pasar lo del papel a un sitio digital sencillo (clientes, citas o pedidos) y tener claro qué te quita más tiempo. Con eso hecho, esto cambia.',
      service: 'ninguno',
      serviceLabel: '',
      serviceHref: '',
    }
  }

  // ── 2. Base muy floja pero con un dolor concreto ────────────────────────
  // Hay un dolor de verdad, pero la base esta sin ordenar. La IA puede ayudar,
  // pero el primer paso honesto es ordenar lo minimo, no saltar a la IA.
  if (baseSinOrdenar(a) && dolor && dolor !== 'ninguno') {
    const focoDolor =
      dolor === 'visibilidad'
        ? 'que te encuentren'
        : dolor === 'repetir'
          ? 'dejar de repetir lo mismo'
          : dolor === 'manual'
            ? 'quitarte tareas manuales'
            : 'entender tus datos'
    return {
      tone: 'cimientos',
      verdict: 'Hay margen para la IA, pero primero hay que ordenar lo de debajo.',
      aporta: `Tu dolor (${focoDolor}) es justo de los que la IA resuelve bien. La oportunidad existe.`,
      todavia:
        'Ahora mismo lo llevas casi todo a mano y sin apoyo técnico. Si montamos IA encima de eso, se cae. Primero hay que tener los datos en un sitio.',
      primerPaso:
        'Un primer paso pequeño: pasar a digital lo más básico (lo que toque tu dolor) y, en paralelo, una auditoría corta para no gastar de más. Te decimos por dónde sí y por dónde todavía no.',
      service: 'auditoria',
      serviceLabel: SERVICE_META.auditoria.label,
      serviceHref: SERVICE_META.auditoria.href,
    }
  }

  // ── 3. Dolor = visibilidad / objetivo = que te encuentren -> GEO ────────
  if (dolor === 'visibilidad' || objetivo === 'encontrar') {
    return {
      tone: 'listo',
      verdict: 'Donde más te aporta hoy: que te encuentren, también cuando preguntan a una IA.',
      aporta:
        'Cada vez más gente busca preguntando a ChatGPT o Google AI en vez de teclear. Si ahí no apareces, para ese cliente no existes. Esto se trabaja y se nota.',
      todavia:
        'No esperes un "número uno en ChatGPT": eso no existe y quien lo venda miente. Es trabajo de estructura y presencia, con mediciones honestas, no magia.',
      primerPaso:
        'Empieza por ver cómo te describe una IA hoy. En Visibilidad en IA tienes una radiografía en vivo con el nombre real de tu negocio: ahí se ve el hueco.',
      service: 'geo',
      serviceLabel: SERVICE_META.geo.label,
      serviceHref: SERVICE_META.geo.href,
    }
  }

  // ── 4. Dolor = repetir / manual u objetivo = ganar tiempo -> software ───
  if (dolor === 'repetir' || dolor === 'manual' || objetivo === 'tiempo') {
    const detalle =
      dolor === 'repetir'
        ? 'Responder lo mismo decenas de veces al día (horarios, precios, citas) es de lo primero que una máquina puede llevar por ti.'
        : 'Copiar datos de un sitio a otro, montar informes a mano, pasar pedidos: ese trabajo repetitivo es justo donde la IA y la automatización ganan horas.'
    return {
      tone: 'listo',
      verdict: 'Donde más te aporta hoy: devolverte las horas que se van en lo repetitivo.',
      aporta: detalle,
      todavia:
        'No todo se automatiza ni conviene hacerlo de golpe. Lo que necesita criterio humano se queda contigo. Se empieza por una tarea concreta, no por "automatizar la empresa".',
      primerPaso:
        'Identifica la tarea que más se repite y mídela una semana (cuánto tiempo se te va). Con eso claro, vemos si una solución a medida sale a cuenta.',
      service: 'software',
      serviceLabel: SERVICE_META.software.label,
      serviceHref: SERVICE_META.software.href,
    }
  }

  // ── 5. Dolor = decidir a ciegas / objetivo = entender datos ─────────────
  // Aqui la IA ayuda, pero depende de tener los datos en orden. La auditoria
  // es el paso honesto para no prometer de mas.
  if (dolor === 'ciegas' || objetivo === 'entender') {
    const dataReady = a.datos === 'integrado' || a.datos === 'herramientas'
    return {
      tone: dataReady ? 'listo' : 'parcial',
      verdict: 'Quieres decidir con datos, no a ojo. Ahí la IA ayuda, con una condición.',
      aporta:
        'Si tus datos están en un sitio razonable, la IA te ayuda a leerlos: detectar patrones, anticipar y resumir lo que pasa sin que te pelees con hojas de cálculo.',
      todavia: dataReady
        ? 'El salto a "que la IA decida por ti" no toca: te da lectura y criterio, la decisión sigue siendo tuya.'
        : 'Hoy tus datos están repartidos y sin orden. Antes de pedirle conclusiones a una IA, hay que juntarlos donde se puedan leer. Si no, te dará respuestas bonitas pero vacías.',
      primerPaso: dataReady
        ? 'Una auditoría corta para ver qué pregunta de negocio quieres responder primero y con qué datos. De ahí sale el alcance real.'
        : 'Primero, juntar los datos que ya tienes en un sitio. En paralelo, una auditoría para priorizar. Te decimos qué se puede leer ya y qué no todavía.',
      service: 'auditoria',
      serviceLabel: SERVICE_META.auditoria.label,
      serviceHref: SERVICE_META.auditoria.href,
    }
  }

  // ── 6. Sin dolor ni objetivo claros (pero con algo de base) -> auditoria ─
  if (sinRumbo(a)) {
    return {
      tone: 'parcial',
      verdict: 'Vienes a explorar, y está bien. Sin un objetivo claro, lo honesto es no vender nada.',
      aporta:
        'Tienes algo de base montada, así que cuando aparezca un objetivo concreto (que te encuentren, ganar tiempo, entender datos), hay desde dónde empezar.',
      todavia:
        'Sin un dolor o una meta concreta, meter IA sería poner una solución a un problema que aún no has nombrado. No tiene sentido y no te lo vamos a vender.',
      primerPaso:
        'Quédate con una pregunta: ¿qué te quita más tiempo o más clientes cada semana? Cuando lo tengas, una conversación corta (sin compromiso) basta para ver si la IA pinta algo.',
      service: 'auditoria',
      serviceLabel: SERVICE_META.auditoria.label,
      serviceHref: SERVICE_META.auditoria.href,
    }
  }

  // ── 7. Por defecto: hay base y rumbo, pero sin un foco unico -> auditoria
  return {
    tone: 'parcial',
    verdict: 'Hay por dónde, y conviene priorizar antes de gastar.',
    aporta:
      'Por lo que cuentas, la IA puede aportar en más de un frente. Eso es bueno, pero también es la forma más fácil de dispersarse y gastar de más.',
    todavia:
      'Hacerlo todo a la vez no sale a cuenta. El valor está en elegir el primer frente con cabeza, no en abrir cinco a la vez.',
    primerPaso:
      'Una auditoría corta para ordenar prioridades: por dónde empezar para notarlo pronto y qué dejar para después. Si lo honesto es esperar, te lo decimos.',
    service: 'auditoria',
    serviceLabel: SERVICE_META.auditoria.label,
    serviceHref: SERVICE_META.auditoria.href,
  }
}

/** Etiqueta legible del sector, para el contexto del correo. */
export function sectorLabel(a: ReadinessAnswers): string | undefined {
  const q = READINESS_QUESTIONS.find((x) => x.id === 'sector')
  return q?.options.find((o) => o.id === a.sector)?.label
}

/** Etiqueta legible del dolor principal, para el contexto del correo. */
export function dolorLabel(a: ReadinessAnswers): string | undefined {
  const q = READINESS_QUESTIONS.find((x) => x.id === 'dolor')
  return q?.options.find((o) => o.id === a.dolor)?.label
}
