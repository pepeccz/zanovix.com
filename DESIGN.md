---
name: Zanovix
description: IA aplicada con ingenieria pausada — herramienta honesta calida
version: 2
colors:
  paper: "oklch(0.976 0.005 165)"
  surface: "oklch(0.957 0.008 165)"
  ink: "#1F2A26"
  forest: "oklch(0.245 0.030 165)"
  forest-deep: "oklch(0.205 0.026 165)"
  teal: "#3BAA8C"
  teal-deep: "#2A8A70"
  teal-bright: "oklch(0.80 0.130 170)"
  night: "#14201B"
  ink-soft: "color-mix(in oklab, #1F2A26 88%, transparent)"
  ink-mute: "color-mix(in oklab, #1F2A26 85%, transparent)"
  ink-mute-strong: "color-mix(in oklab, #1F2A26 86%, transparent)"
  paper-overlay: "color-mix(in oklab, oklch(0.976 0.005 165) 86%, transparent)"
  paper-on-dark: "#F4F1EA"
  paper-on-dark-soft: "color-mix(in oklab, #F4F1EA 82%, transparent)"
  paper-on-dark-mute: "color-mix(in oklab, #F4F1EA 64%, transparent)"
  teal-soft: "color-mix(in oklab, #3BAA8C 60%, transparent)"
  teal-faint: "color-mix(in oklab, #3BAA8C 16%, transparent)"
  rule: "color-mix(in oklch, #1F2A26 12%, transparent)"
  rule-strong: "color-mix(in oklch, #1F2A26 26%, transparent)"
  rule-invert: "color-mix(in oklch, #F4F1EA 16%, transparent)"
typography:
  display:
    fontFamily: "'League Spartan Variable', 'League Spartan', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 3.5vw + 1rem, 4rem)"
    fontWeight: 560
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "'League Spartan Variable', 'League Spartan', system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 0.6vw + 1rem, 1.5rem)"
    fontWeight: 540
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Hanken Grotesk Variable', system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.2vw + 0.95rem, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  brandLabel:
    fontFamily: "'League Spartan Variable', 'League Spartan', system-ui, sans-serif"
    fontSize: "clamp(0.75rem, 0.1vw + 0.72rem, 0.8125rem)"
    fontWeight: 500
    textTransform: "uppercase"
    letterSpacing: "0.08em"
  monoLabel:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "clamp(0.75rem, 0.1vw + 0.72rem, 0.8125rem)"
    fontWeight: 400
    letterSpacing: "0.08em"
spacing:
  hero-y: "clamp(4rem, 6vw + 2rem, 9rem)"
  section-y: "clamp(3rem, 4vw + 2rem, 7.5rem)"
  section-x: "clamp(1.25rem, 1.5vw + 1rem, 3rem)"
  stack: "clamp(1rem, 1vw + 0.75rem, 2rem)"
components:
  emphasis-underline:
    backgroundColor: "{colors.teal-faint}"
    textColor: "{colors.ink}"
  hairline:
    backgroundColor: "{colors.rule}"
  hairline-strong:
    backgroundColor: "{colors.rule-strong}"
---

# Design System: Zanovix (v2)

> Esta es la version vigente del sistema. La v1 ("editorial con calidez humana":
> Cormorant/Newsreader/Inter, 7 capitulos con scroll secuestrado, flor flotante)
> queda derogada. El historial git la conserva. Fuentes de verdad de diseno:
> PRODUCT.md, docs/estrategia/01-estrategia-mensaje.md, y la decision de direccion
> en engram (topic web/rediseno-direccion). Implementacion viva: src/styles/global.css.

## 1. Overview

**Mundo visual: "Herramienta honesta calida"**

Zanovix se siente como abrir un asistente competente y tranquilo, no como un
folleto. El asistente que piensa en voz alta (Companion) es el heroe de la home y
una capa transversal del sitio: el medio es el mensaje (principio nº1). Precision
de Linear pero calida, en la familia de Raycast y un Vercel humano. El monospace
se usa FUNCIONALMENTE, porque es una herramienta real, no como eyebrow decorativo.

El sistema rechaza dos errores de la categoria y, ademas, un tercero que la v1
cometio: el lane "editorial-typographic" (display serif italico + etiquetas mono +
filetes + monocromo crema), el reflejo-IA mas saturado de 2026. La paleta evoluciona,
no se tira: se conserva el verde/teal como marca ownable, pero el fondo abandona el
crema calido (#F4F1EA, el default-IA calido) por un off-white tintado HACIA el verde
de marca, con mas contraste y un teal con mas intencion.

El movimiento es calmado y al servicio de la narrativa: smooth scroll con Lenis,
reveals sobrios via IntersectionObserver. Sin scroll secuestrado, sin pins de 200vh,
sin reveals palabra a palabra. `prefers-reduced-motion` salta siempre al estado final.

**Caracteristicas clave:**
- Tres roles tipograficos: League Spartan (display de marca: titulares + nav + etiquetas, la tipo del logo) + Hanken Grotesk (cuerpo) + JetBrains Mono (tecnico puntual).
- Paleta OKLCH tintada al verde de marca (~hue 165), no crema. Un acento (teal) con intencion.
- WCAG 2.2 AA como requisito medido, no aspiracion.
- Plano absoluto: sin box-shadow. Hairlines de 1px como unico separador superficial.
- Escala fluid (clamp), display ≤4rem: la herramienta no grita.
- Motion como capa opcional que dirige la atencion, nunca requisito de comprension.

## 2. Colors

Paleta "restrained/committed" en OKLCH. El tinte de los neutros apunta al hue de
marca (~165), no a warmth-por-defecto. Se anade un verde profundo "drenched"
(forest / forest-deep) para el Companion y las superficies de prueba.

### Neutros (sobre claro)
- **paper** `oklch(0.976 0.005 165)`: superficie base. Off-white calmo tintado al verde, NO crema. Sustituye al antiguo `#F4F1EA`.
- **surface** `oklch(0.957 0.008 165)`: superficie de seccion, un paso por debajo de paper.
- **ink** `#1F2A26`: texto principal. Verde muy oscuro, no negro.

### Drenched (superficies oscuras)
- **forest** `oklch(0.245 0.030 165)`: panel drenched (el Companion vive aqui).
- **forest-deep** `oklch(0.205 0.026 165)`: drenched mas profundo (inputs, contraste interno).
- **night** `#14201B`: reservado para dark mode futuro. No usar en produccion.

### Acento
- **teal** `#3BAA8C`: acento decorativo / texto grande. **NO sirve para texto de cuerpo** (2.55:1 sobre paper). Usar con disciplina; su rareza es su fuerza.
- **teal-deep** `#2A8A70`: variante para texto de acento que necesita AA sobre claro.
- **teal-bright** `oklch(0.80 0.130 170)`: acento sobre superficies oscuras (forest), focos, CTA del Companion.

### Tintas con jerarquia (medidas sobre el nuevo paper)
Sobre `paper` (oklch 0.976) el minimo teorico para AA 4.5:1 es ~84% alpha. Por eso
las tintas v2 viven en la banda 85-88%, NO en la banda baja de la v1 (55-76%), que
no pasaria sobre este fondo:
- **ink-soft** (88% → ~5.7:1): texto de cuerpo secundario.
- **ink-mute-strong** (86% → ~5.1:1): labels, navegacion, metadatos legibles.
- **ink-mute** (85% → ~4.73:1): eyebrow / meta de menor jerarquia. Pasa AA, justo.

### Tintas sobre oscuro (texto paper sobre forest)
- **paper-on-dark** `#F4F1EA`: texto principal sobre forest.
- **paper-on-dark-soft** (82%): secundario sobre forest.
- **paper-on-dark-mute** (64%): metadatos / placeholders sobre forest.

### Divisores
- **rule** (12% ink) y **rule-strong** (26% ink): hairlines sobre claro.
- **rule-invert** (16% paper): hairlines sobre superficies oscuras (forest).

### Reglas nombradas
**La Regla del Acento con Intencion.** teal es el unico color cromatico. Aparece pocas
veces y con proposito (focos, CTA, subrayado). Demasiado teal a la vez es un error.

**La Regla del Contraste Medido.** teal sobre paper NO pasa AA para texto (2.55:1):
usar ink o teal-deep. Las tintas ink-* viven en 85-88% sobre el nuevo paper; valores
mas bajos no pasan. Medir antes de bajar la opacidad.

## 3. Typography

**Display de marca:** League Spartan Variable (la tipo del logo ZAN✿VIX). Cubre TODOS
los titulares (h1/h2/display, clase `.display` y bloques `var(--font-display)`), los
links del nav y las etiquetas cortas uppercase (eyebrows / kickers / tags de paso /
metadatos). El objetivo es que el sitio "hable" el mismo idioma que el logo. Token
`--font-brand` para etiquetas uppercase que no son titulares pero sí marca.
**Cuerpo:** Hanken Grotesk Variable (lectura larga: parrafos, lede, texto corrido).
League Spartan NO va en el cuerpo: es display geometrico y cansa en bloques largos.
**Mono tecnico:** JetBrains Mono SOLO en contextos genuinamente tecnicos: lecturas
numericas (contadores, numeros de paso), mailto mostrado como dato, labels de
formulario y UI del asistente/simuladores. No es eyebrow-disfraz.

**Fuentes retiradas:** Cormorant Garamond, Newsreader e Inter quedan fuera del sistema;
eran el lane editorial-IA que el rediseno abandona. JetBrains Mono se mantiene porque
su uso aqui es funcional (dato tecnico real), no decorativo.

**Pesos y tracking de League Spartan:** geometrica, lee mas pesada que la grotesca, asi
que en display grande sentence-case pide menos peso (540-560, no 600) y un tracking
ligeramente NEGATIVO (-0.025em a -0.035em) para que las geometricas no se abran de mas.
En uppercase de nav/etiquetas pide tracking POSITIVO (~0.08em, como el logo).

**Caracter:** tres roles, no cuatro familias. La jerarquia se construye con peso, escala
y el cambio display(marca)→cuerpo. El token `--font-serif` apunta temporalmente a la
grotesca de cuerpo para no romper paginas aun sin migrar; se retirara al rediseno completo.

**Wordmark:** el logotipo es un asset SVG vectorizado (no se carga como fuente web):
estable, sin dependencia de carga ni degradacion por fallback. El isotipo SVG real
(header/footer/favicon) es la marca persistente del sitio.

### Escala fluid (display ≤4rem, ratio ≥1.25)
- **display** `clamp(2.5rem, 3.5vw + 1rem, 4rem)`: titulares de hero y seccion en League Spartan. Peso 560, line-height 1.02, letter-spacing -0.035em (clase `.display`). La herramienta no grita: techo 4rem.
- **h1** `clamp(2rem, 2.2vw + 1rem, 3rem)`: titulos de pagina interna.
- **h2** `clamp(1.5rem, 1.2vw + 1rem, 2.25rem)`: subtitulos de seccion.
- **h3** `clamp(1.25rem, 0.6vw + 1rem, 1.5rem)`: titulos de componente.
- **lede** `clamp(1.125rem, 0.4vw + 1rem, 1.375rem)`: parrafo introductorio.
- **body** `clamp(1rem, 0.2vw + 0.95rem, 1.125rem)`: cuerpo, line-height 1.6, max 65-75ch.
- **eyebrow / etiqueta de marca** `clamp(0.75rem, 0.1vw + 0.72rem, 0.8125rem)`: etiqueta uppercase en League Spartan (`--font-brand`), peso 500, tracking 0.08em. El mono solo donde es dato tecnico real (`--font-mono`).

### Reglas nombradas
**La Regla de los Tres Roles.** League Spartan (display de marca: titulares + nav +
etiquetas) + Hanken Grotesk (cuerpo) + JetBrains Mono (tecnico puntual). No anadir una
cuarta familia. La jerarquia viene del peso, la escala y el cambio display→cuerpo.
(Deroga la "Regla de las Dos Familias" de la v2 temprana y la "Regla de los Cuatro
Roles" de la v1.)

**La Regla del Logo como Voz.** League Spartan es la tipo del wordmark ZAN✿VIX; los
titulares, el nav y las etiquetas la usan para que el sitio hable el idioma del logo.
League Spartan NO va en el cuerpo (es display: cansa en lectura larga).

**La Regla del Mono Funcional.** El monospace marca dato tecnico real (lecturas
numericas, mailto, labels de formulario, UI del asistente/simuladores), nunca un
eyebrow decorativo encima de cada seccion. Mono como disfraz de "tecnico" es un tell de IA.

**La Regla de la Escala Fluid.** Todos los tamanos son clamp(). Sin breakpoints fijos.

## 4. Elevation

Plano por decision. Sin box-shadows estructurales. La profundidad se comunica con
jerarquia tipografica, contraste de color entre superficie y contenido (paper /
surface / forest), y separacion espacial fluid.

Las hairlines (`rule`, `rule-strong`, `rule-invert`) son el unico separador
superficial: 1px a baja opacidad, nunca bordes gruesos ni sombras.

### Reglas nombradas
**La Regla del Plano Absoluto.** Ningun elemento usa box-shadow como elevacion. Si
algo destaca, lo hace por jerarquia o contraste, no por sombra.

**La Regla de la Hairline.** Divisores siempre de 1px. Mayor grosor decorativo
prohibido. (Excepcion deliberada: el subrayado teal del mailto, 2px, como acento.)

## 5. Components

### Companion (asistente transparente) — eje del sistema
Isla React (`src/components/react/Companion.tsx`). Panel drenched (forest) donde el
visitante cuenta que hace su empresa y el asistente MUESTRA lo que infiere (sector,
dolor, urgencia) de forma editable. La transparencia es la demo de "IA aplicada con
honestidad". v1 = inferencia determinista por reglas, sin red ni LLM. v2 (fuera de
alcance) = swap del motor de inferencia tras un contrato estable (`Inferencer`), sin
reescribir la superficie. Dos formas por prop `variant`: `hero` (home, panel completo)
y `dock` (resto, forma reducida persistente). Contexto entre paginas via sessionStorage
(`zx.companion.v1`), escrito solo tras accion del visitante. Degradacion: sin JS el
contacto normal (hola@zanovix.com) sigue disponible. A11y: input etiquetado, aria-live,
teclado completo, reduced-motion salta al estado final.

### Container
Dos anchuras maximas: `narrow` (720px) para texto largo, `wide` (1180px) para layouts
de seccion. Padding horizontal `--spacing-section-x`.

### Section
Padding vertical por escala (`sm`/`md`/`lg`) mapeado a `--spacing-section-y`.

### Listado con hairline (patron de seccion preferido)
En vez de card-grid identico, las colecciones (servicios, principios) se listan con
separadores hairline de 1px y composicion en dos columnas asimetricas. Evita el slop
de "tarjetas iguales con icono + titulo + texto repetidas".

### Eyebrow / etiqueta mono
JetBrains Mono, uppercase, `--text-eyebrow`. Solo donde es etiqueta FUNCIONAL real (p.
ej. estado del asistente). Prohibido como scaffolding encima de cada seccion.

### Navegacion (header sticky)
Z-index 50. Estado scroll (`nav--scrolled`) via IntersectionObserver inline. Paginas sin
hero entran directamente en estado scrolled. Menu movil: overlay full-screen accesible
(focus trap, Esc, bloqueo de scroll).

### Botones / CTA
No hay un Button formal de sistema sobre claro: los CTA son enlaces con tipografia de
cuerpo o el mailto con subrayado teal. El Companion SI tiene CTA solidos (teal-bright
sobre forest) por ser una herramienta. No inventar botones con sombra sobre paper.

## 6. Motion

- **Lenis** para smooth scroll global. No se inicializa con reduced-motion.
- **Reveals** sobrios via la isla `Reveal` (IntersectionObserver puro, 0KB de lib):
  enhance de contenido ya visible, nunca gate de visibilidad.
- **Curva** expo-out `cubic-bezier(0.16, 1, 0.3, 1)`, duraciones 180-600ms.
- **Prohibido** (derogado de la v1): scroll secuestrado, pins de 200vh, reveals
  palabra a palabra, mascaras de scroll-jacking, contadores con numeros no atribuibles.
- **reduced-motion** elimina la capa de motion: estado final directo, sin alternativa
  animada. `data-motion='reduced'` en `<html>` y no se inicializa Lenis ni GSAP.

### Retirados respecto a la v1
- **FlorPersistente** (flor flotante bottom-right): retirada. Era el motion mark del
  mundo editorial viejo, solapaba en movil y no encaja en "herramienta honesta calida".
  La marca persistente es el isotipo SVG del header/footer.
- **scroll-system de capitulos** (word-by-word, counter, palette inversion),
  **flor-bloom** y **flor-video-mask**: retirados; servian a capitulos que ya no existen.

## 7. Do's and Don'ts

### Do
- **Do** usar `paper` (oklch 0.976 0.005 165) como fondo base. Nunca `#FFFFFF` ni el viejo crema `#F4F1EA` como fondo de pagina.
- **Do** llevar los titulares, el nav y las etiquetas en League Spartan (la tipo del logo); el cuerpo en Hanken Grotesk; el mono solo para dato tecnico real.
- **Do** medir contraste: teal NO en texto de cuerpo; tintas ink-* en 85-88% sobre el nuevo paper.
- **Do** usar forest/forest-deep para el Companion y superficies de prueba drenched.
- **Do** preferir listados con hairline a card-grids repetidos.
- **Do** mantener el motion calmado (Lenis + Reveal) y reduced-motion siempre.
- **Do** preservar la distincion logo SVG real (identidad) vs cualquier mark de animacion.

### Don't
- **Don't** volver al lane editorial: sin Cormorant/Newsreader/Inter, sin monocromo crema.
- **Don't** usar scroll secuestrado, pins de 200vh, reveals palabra a palabra ni mascaras de scroll-jacking.
- **Don't** usar numeros no atribuibles (caso 80.000€, +31,8% impresiones). Honestidad de marca.
- **Don't** usar box-shadow como elevacion ni `border-width` >1px decorativo (salvo el subrayado teal de acento).
- **Don't** anadir una cuarta familia tipografica, usar League Spartan en el cuerpo, ni usar mono como disfraz "tecnico".
- **Don't** usar `night` en produccion hasta que el dark mode este disenado.
- **Don't** reintroducir la flor flotante ni los capitulos editoriales.
