# Spec: el Asistente como embudo central

> Estado: propuesta de shape para revisar. Decisiones marcadas como **[Propuesta]** son
> reversibles; las marcadas **[Acordado]** salen del discovery con el usuario.
> Fecha: 2026-06. Fuente: discovery + mapa técnico de interfaces.

## 1. Objetivo y rol

**[Acordado]** El Assistant deja de ser un acompañante lateral que deriva al
formulario y pasa a ser la **vía principal de conversión**. Su trabajo: **orientar
honestamente** ("¿te aporta la IA o no, y por dónde empezar?"), apoyándose en los
**demos como instrumentos** de evidencia, y **recoger el lead dentro del propio chat**.

- Los CTA del sitio (`data-open-contact`: "Reservar diagnóstico", etc.) **abren el
  asistente**, no el formulario popup.
- El formulario popup (`ContactDialog`) y la página `/contacto` quedan como
  **fallback** (sin JS, degradación del LLM, o "prefiero un formulario").

**Principio anti-hype:** el asistente no opina, **enseña** (corre un instrumento y
construye la orientación sobre el resultado real). Y puede concluir honestamente
"la IA no te aporta ahora", igual que la skill `znx-diagnostico`.

## 2. Riesgo principal y mitigación (no negociable)

Forzar **todo** CTA a una conversación puede perder al visitante que **ya decidió** y
solo quiere reservar rápido. Mitigaciones obligatorias:

1. **Salida directa visible desde el primer mensaje:** botón "Prefiero un formulario /
   Reservar sin charlar" que abre el `ContactDialog` (evento `zx:open-contact`).
2. **Degradación robusta:** si el LLM cae (`x-assistant-degraded: 1`), el asistente
   ofrece de inmediato el formulario. La conversión nunca depende del LLM.
3. **Sin JS:** los CTA siguen siendo `<a href="/contacto">` → caen en la página con
   el `LeadForm`. El asistente es enhancement, no requisito.
4. **Opt-in estricto:** el asistente solo se abre por acción explícita (CTA o
   lanzador). Nada de auto-apertura. (Coherente con el diseño actual y la marca.)

## 3. Flujo conversacional (UX)

```
Apertura (CTA o lanzador)
  -> Nota de transparencia (es IA, se procesa con OpenRouter) [ya existe]
  -> Salida directa visible: "Prefiero un formulario"          [NUEVO]
  -> Orientación: 2-4 preguntas cortas sobre el negocio
       -> El asistente elige UN instrumento segun la situacion:
            - visibilidad/web        -> Radiografia GEO  (/api/geo-snapshot)
            - "necesito IA? listo?"  -> AI Readiness     (readReadiness, sin red) [fase 2]
            - trabajo manual repetido-> Boceto automatiz.(/api/automation-sketch) [fase 2]
       -> Muestra el resultado del instrumento como EVIDENCIA en el chat
  -> Veredicto honesto: "te aporta en X, no tanto en Y. Esto es una orientacion
     gratis; el diagnostico de verdad es humano y a fondo."
  -> Remate: "Lo reservamos?" -> recoge nombre + email + consentimiento  [NUEVO]
       -> POST /api/lead (context = resumen conversacion + veredicto del instrumento)
       -> Confirmacion honesta (o fallback a email si delivered=false)
```

La orientación es **somera y honesta** **[Acordado]**: es el pre-diagnóstico gratis,
NO el diagnóstico de pago (humano, a fondo). El asistente lo dice explícitamente y no
finge profundidad.

## 4. Decisiones resueltas (propuesta)

### 4.1 Qué demos integra y cuándo
**[Acordado]** El asistente **elige el instrumento** según lo que diga el visitante
(no corre los tres a la vez en una misma orientación). **Fase 1 integra los TRES**
instrumentos: Radiografía GEO (`/api/geo-snapshot`), AI Readiness (`readReadiness`,
determinista, sin red) y Boceto de automatización (`/api/automation-sketch`). El LLM
decide cuál disparar por marcador según la situación:
- visibilidad/web -> Radiografía GEO
- "¿necesito IA? / ¿estoy listo?" -> AI Readiness
- trabajo manual repetido -> Boceto de automatización

Reutiliza la lógica de `src/lib/companion/geo.ts`, `src/lib/readiness/readiness.ts`,
`src/lib/automation/sketch.ts` (todas exponen su contrato sin montar el componente).
Nota: MVP más grande (3 instrumentos a la vez); validarlo de golpe tiene más superficie,
mitigado por trocear en slices (cada instrumento es un slice independiente).

### 4.2 Profundidad de la orientación
**[Acordado]** Somera: 2-4 preguntas + un instrumento + veredicto. Framing explícito de
"esto no es el diagnóstico". Capaz de concluir "no te aporta" sin vender.

### 4.3 Recogida de datos y consentimiento
**[Acordado]** Se recoge **dentro del chat**, reusando el backend `/api/lead`
(validación, honeypot, rate-limit, SMTP). **Datos mínimos:** `nombre` + `email` +
`consentimiento`. El `message`/`context` se **autorrellena** con el resumen de la
conversación + el veredicto del instrumento (el asistente ya lo tiene), así que no se
pregunta. **Consentimiento RGPD explícito in-chat** (afirmación + enlace a
`/privacidad`) antes de postear con `consent:true`. La recogida es un **widget de
cliente** (campos reales), NO el LLM "tecleando" los datos.

### 4.4 Remate al diagnóstico de pago
**[Acordado]** Tras el veredicto, encuadra el siguiente paso honesto (reservar el
diagnóstico) y recoge el lead. `origin: 'asistente-embudo'`.

## 5. Arquitectura técnica

Reutiliza el patrón de **marcadores `[[...]]`** que ya existe (`[[ABRIR_CONTACTO]]`).
El LLM emite marcadores; el **cliente** renderiza el widget adecuado. El servidor sigue
simple (stream de texto + system prompt).

### 5.1 Protocolo de marcadores (extensión)
- `[[RADIOGRAFIA_GEO]]` -> el cliente muestra el mini-input GEO (nombre/sector/zona),
  llama a `POST /api/geo-snapshot`, y **reinyecta** el `GeoSnapshot` como contexto para
  que el LLM construya el veredicto sobre evidencia.
- `[[RECOGER_LEAD]]` -> el cliente muestra el mini-form (nombre + email + consent),
  postea a `/api/lead` con el contexto autorrellenado.
- `[[ABRIR_CONTACTO]]` -> (ya existe) salida directa al `ContactDialog`.
- (fase 2) `[[AI_READINESS]]`, `[[BOCETO_AUTOMATIZACION]]`.

El system prompt (`ASSISTANT_SYSTEM_PROMPT` en `src/lib/assistant/assistant.ts`) se
amplía para: (a) hacer la orientación honesta, (b) decidir el instrumento, (c) emitir el
marcador correcto, (d) no inventar el veredicto (espera al resultado del instrumento),
(e) ofrecer el formulario directo si el visitante quiere ir al grano.

### 5.2 Apertura del asistente desde los CTA
- Nuevo evento global `zx:open-assistant` (con `detail` opcional: `origin`, intent).
- El script delegado de `PageLayout.astro` (hoy dispara `zx:open-contact` en
  `data-open-contact`) pasa a disparar **`zx:open-assistant`**.
- El `Assistant` escucha `zx:open-assistant` y abre el panel (hoy solo abre por click
  en su lanzador; se añade el listener).
- **[Propuesta]** Los CTA propios de los demos (`GeoSimulator`/`ReadinessCheck`/
  `AutomationSketch`) **mantienen su comportamiento actual** (abren el form con
  contexto rico): ya están resueltos y reduce el blast radius. Solo se recablean los CTA
  genéricos del sitio.

### 5.3 Fallbacks
- Sin JS: `<a href="/contacto">` -> página con `LeadForm`.
- LLM degradado: el asistente muestra el botón al formulario (ya detecta la cabecera).
- `/api/lead` con email no configurado: misma degradación honesta que el form
  (`delivered:false` -> muestra el email de contacto).

## 6. Edge cases / estados
- Rate-limit del asistente (30/10min) y del lead (5/10min): mensajes honestos.
- Usuario cierra el chat a media orientación: nada se envía hasta el `[[RECOGER_LEAD]]`
  + consent. Sin datos a medias.
- Honeypot `company_url`: el mini-form de lead lo incluye oculto.
- Consentimiento no marcado: no se postea; el asistente lo pide de nuevo.
- Doble envío: bloquear durante el POST (como `sending` en el chat).

## 7. Marca / copy / a11y
- Voz: peninsular, tú, anti-hype, sin guiones largos. Honestidad: sin cifras no
  atribuibles, puede decir "no te aporta".
- Visual: mundo del panel del asistente (sistema actual), instrumentos en su estética
  forest. League Spartan en titulares/etiquetas del panel, Hanken en cuerpo.
- A11y: el panel ya es `dialog` con focus-trap/Esc/aria-live. Los mini-forms (GEO,
  lead) deben ser accesibles (labels, errores in-line, foco), igual que `LeadForm`.

## 8. Slices de implementación (troceo)
1. **Recablear CTA -> asistente** + evento `zx:open-assistant` + salida directa al
   formulario visible. (El asistente se abre desde los CTA; el form queda de fallback.)
2. **Orientación honesta**: ampliar el system prompt para el flujo de orientación
   (preguntas + decisión de instrumento + veredicto + framing "no es el diagnóstico").
3. **Recogida de lead in-chat**: marcador `[[RECOGER_LEAD]]` + mini-form (nombre,
   email, consent) + POST `/api/lead` con contexto autorrellenado + confirmación.
4. **Instrumento GEO in-chat**: marcador `[[RADIOGRAFIA_GEO]]` + widget + reinyección
   del snapshot (reusa `lib/companion/geo.ts` + `/api/geo-snapshot`).
5. **Instrumento AI Readiness in-chat**: marcador `[[AI_READINESS]]` + mini-cuestionario
   + `readReadiness` (determinista, sin red) + reinyección del resultado.
6. **Instrumento Boceto automatización in-chat**: marcador `[[BOCETO_AUTOMATIZACION]]` +
   widget + `/api/automation-sketch` + reinyección.
7. **Pulido**: degradación, edge cases, copy, a11y, QA visual de todo el flujo.

Cada slice es una rama/PR pequeño y verificable. Slices 1-3 son el esqueleto del embudo
(ya convierte); 4-6 añaden los instrumentos uno a uno; 7 remata.

## 9. Decisiones cerradas y preguntas abiertas
- **[Cerrado] Instrumentos fase 1:** los tres (GEO + AI Readiness + Boceto), uno por
  slice (4, 5, 6).
- **[Default, ajustable] CTA de los demos:** siguen yendo directo al formulario con su
  contexto rico (menos blast radius); solo se recablean los CTA genéricos del sitio.
- **[Default, ajustable] Proactividad:** opt-in estricto (sin auto-apertura), como pide
  la marca.
