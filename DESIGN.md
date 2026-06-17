---
name: Zanovix
description: IA aplicada con ingenieria pausada — sistema visual editorial con calidez humana
colors:
  paper: "#F4F1EA"
  ink: "#1F2A26"
  teal: "#3BAA8C"
  teal-deep: "#2A8A70"
  night: "#14201B"
  ink-soft: "color-mix(in oklab, #1F2A26 76%, transparent)"
  ink-mute: "color-mix(in oklab, #1F2A26 55%, transparent)"
  ink-mute-strong: "color-mix(in oklab, #1F2A26 72%, transparent)"
  paper-overlay: "color-mix(in oklch, #F4F1EA 92%, transparent)"
  teal-soft: "color-mix(in oklch, #3BAA8C 60%, transparent)"
  teal-faint: "color-mix(in oklch, #3BAA8C 18%, transparent)"
  rule: "color-mix(in oklch, #1F2A26 14%, transparent)"
  rule-strong: "color-mix(in oklch, #1F2A26 28%, transparent)"
typography:
  display:
    fontFamily: "'Cormorant Garamond Variable', 'Newsreader Variable', Georgia, serif"
    fontSize: "clamp(3rem, 5vw + 1rem, 6rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Newsreader Variable', Georgia, serif"
    fontSize: "clamp(2.5rem, 2.2vw + 1.8rem, 4.75rem)"
    fontWeight: 400
    lineHeight: 1.1
  title:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 0.6vw + 1rem, 1.625rem)"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.25vw + 0.94rem, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "clamp(0.6875rem, 0.15vw + 0.66rem, 0.8125rem)"
    fontWeight: 400
    letterSpacing: "0.08em"
spacing:
  hero-y: "clamp(4rem, 6vw + 2rem, 10rem)"
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
  eyebrow:
    textColor: "{colors.ink-mute}"
    typography: "{typography.label}"
---

# Design System: Zanovix

## 1. Overview

**Creative North Star: "El Artesano que te Habla de Tu"**

Zanovix es un estudio de IA aplicada cuya identidad visual rechaza los dos grandes errores de la categoria: la agencia creativa ruidosa que compensa con efecto lo que le falta en sustancia, y la consultora corporativa fria que confunde distancia con rigor. Este sistema se situa en un tercer lugar: el de un artesano experto que habla directamente, sin humo, con trabajo real detras de cada palabra.

La estetica es editorial con calidez humana. El papel calido (`#F4F1EA`) no es blanco puro sino crema ligeramente amarillenta, con la temperatura de una pagina bien impresa. El ink es verde oscuro (`#1F2A26`), no negro neutro, lo que da al texto un tono organico que evita la frialdad del digital puro. El unico acento es el teal (`#3BAA8C`), reservado con disciplina: aparece pocas veces, y esa rareza es exactamente su fuerza.

La tipografia combina cuatro familias con roles estrictamente separados. Cormorant Garamond en display lleva el peso ceremonial de los titulos grandes. Newsreader en serif ancla la lectura de cuerpo largo. Inter en sans cubre UI, navegacion y textos funcionales. JetBrains Mono en mono marca los eyebrows y los elementos de firma. Las cuatro familias son intencionales; en un audit visual, cada una debe mantener su rol sin invadir el de las otras.

El movimiento es coreografiado pero pausado. Scroll-driven con GSAP, transiciones expo-out, duraciones entre 200 ms y 700 ms. El sitio se mueve como una revista de calidad que respira, no como una landing page de SaaS que grita. `prefers-reduced-motion` elimina completamente la capa de motion — sin animacion alternativa, sin fade, directamente al estado final.

**Caracteristicas clave:**
- Paleta de tres colores: un fondo, un tinta, un acento. Sin secundarios inventados.
- Escala tipografica fluid (clamp), nunca puntos fijos a breakpoints.
- Movimiento scroll-driven como capa opcional, no como requisito de comprension.
- Contenedores con anchura maxima definida: narrow (720 px) y wide (1180 px).
- WCAG 2.2 AA como requisito, no aspiracion.

## 2. Colors

Paleta "restrained/committed": un solo acento (`teal`) sobre un fondo calido. La riqueza visual viene de la temperatura del papel y el tono organico del ink, no de multiples colores.

### Primary
- **Teal Artesanal** (`#3BAA8C`): el unico acento cromatico del sistema. Aparece en subrayados de Emphasis, en contadores animados, en el motion mark de la flor en hover. Prohibido en texto de cuerpo (verificar contraste WCAG 2.2 AA sobre paper `#F4F1EA` — puede quedar por debajo de 4.5:1). Valido en texto grande (display/h1 >18pt) y en elementos decorativos.
- **Teal Profundo** (`#2A8A70`): variante de estado activo/hover para el acento primario. Mayor contraste sobre paper.

### Neutral
- **Papel Calido** (`#F4F1EA`): superficie base de todas las paginas. No es blanco — es crema con temperatura amarilla. Ningun elemento usa blanco puro como fondo.
- **Tinta Verde Oscura** (`#1F2A26`): color de texto principal. Verde muy oscuro, no negro. Toda la tipografia de cuerpo y display usa este tono.
- **Noche Reservada** (`#14201B`): reservado para dark mode futuro. No usar en produccion actual.

### Aliases de opacidad (semantic)
- `ink-soft` (oklab 76% ink): texto secundario con jerarquia clara. Verificar 4.5:1 sobre paper.
- `ink-mute` (oklab 55% ink): eyebrows, metadatos, texto terciario. **Verificar contraste WCAG 2.2 AA sobre paper `#F4F1EA` — riesgo real de quedar por debajo de 4.5:1.**
- `ink-mute-strong` (oklab 72% ink): version intermedia para contextos intermedios. Verificar contraste.
- `paper-overlay` (92% paper): capas de vidrio sobre contenido.
- `teal-soft` (60% teal): fondos de acento suave, nunca texto.
- `teal-faint` (18% teal): fondo del subrayado Emphasis. Solo decorativo.

### Divisores
- `rule`: `color-mix(in oklch, ink 14%, transparent)` — lineas hairline normales (Hairline component).
- `rule-strong`: `color-mix(in oklch, ink 28%, transparent)` — lineas hairline con mayor presencia.

### Reglas nombradas

**La Regla del Acento Unico.** `teal` es el unico color cromatico del sistema. Su rareza es su poder. Cada vez que aparece en una pantalla debe poder contarse con los dedos de una mano. Si teal aparece en mas de cinco elementos visibles al mismo tiempo, hay demasiado teal.

**La Regla del Papel Calido.** Ningun elemento usa `#FFFFFF` como fondo. El blanco puro esta prohibido. La temperatura del papel es parte de la identidad.

**La Regla del Contraste Primero.** `teal` sobre `paper` puede no alcanzar 4.5:1 para texto pequeno. Antes de usar teal en cualquier texto inferior a 18 pt, medir el contraste. Si no pasa, usar `ink` o `teal-deep`.

## 3. Typography

**Display Font:** Cormorant Garamond Variable (con Newsreader Variable, Georgia como fallback)
**Body Font:** Inter Variable (con system-ui como fallback)
**Serif secundario:** Newsreader Variable (cuerpo largo, lede, pull quotes)
**Label/Mono Font:** JetBrains Mono (eyebrows, firma, elementos de codigo)

**Caracter:** El sistema usa cuatro familias porque cada una tiene un rol irremplazable. Cormorant para la ceremonia de los titulos grandes; Newsreader para la lectura sostenida; Inter para la claridad funcional; JetBrains para la firma tecnica. No es exceso — es especializacion. En un audit, si alguna de las cuatro ocupa el espacio de otra, hay una regresion.

**Nota sobre el wordmark:** League Spartan NO se carga como fuente web. El logotipo de Zanovix es un asset SVG con las letras ya vectorizadas. Esto es intencional: el wordmark es estable, no requiere carga de fuente y no puede degradarse por fallbacks.

**Nota sobre el motion mark:** El BrandMark.astro usa una flor geometrica de 8 petalos como "motion mark" — un elemento de sistema de diseno declarado explicitamente, no accidental. Es distinto del logo SVG organico que vive en los assets de branding (`~/zanovix-os/10-branding/logos/`). El logo SVG real manda en la identidad estatica (header, footer, favicon). El motion mark es el elemento de animacion del sistema. Esta distincion es intencional y debe preservarse.

### Escala fluid

- **Giant** (`clamp(7.5rem, 12vw + 1rem, 10rem)`): solo en Hero H1. Cormorant, peso 400, line-height 0.95, letter-spacing -0.02em. Unico en toda la pagina.
- **Display** (`clamp(3rem, 5vw + 1rem, 6rem)`): titulos de seccion principales. Cormorant.
- **H1** (`clamp(2.5rem, 2.2vw + 1.8rem, 4.75rem)`): titulos de paginas internas. Newsreader o Cormorant.
- **H2** (`clamp(1.75rem, 1vw + 1.5rem, 2.75rem)`): subtitulos de seccion. Newsreader o Inter Medium.
- **H3** (`clamp(1.25rem, 0.6vw + 1rem, 1.625rem)`): titulos de componente. Inter Medium.
- **Lede** (`clamp(1.0625rem, 0.4vw + 0.97rem, 1.375rem)`): parrafo introductorio, primer parrafo de seccion. Newsreader.
- **Body** (`clamp(1rem, 0.25vw + 0.94rem, 1.125rem)`): texto de cuerpo general. Inter Regular, line-height 1.65, max 65-75ch.
- **Eyebrow** (`clamp(0.6875rem, 0.15vw + 0.66rem, 0.8125rem)`): etiquetas de categoria, metadatos. JetBrains Mono, uppercase, letter-spacing 0.08em, `ink-mute`.

### Clase `.display-cormorant`
Utilidad CSS para Cormorant en modo display: `font-weight: 400`, `line-height: 0.95`, `letter-spacing: -0.02em`, `font-optical-sizing: auto`. Aplica sobre cualquier texto que use Cormorant como display, no sobre texto de cuerpo.

### Reglas nombradas

**La Regla de los Cuatro Roles.** Cuatro familias, cuatro roles, sin solapamiento. Cormorant = ceremonia display. Newsreader = lectura serif. Inter = UI y funcional. JetBrains = firma tecnica. Si una familia aparece en el rol de otra, es una regresion de identidad.

**La Regla de la Escala Fluid.** Ningun tamano de fuente usa breakpoints fijos. Toda la escala es clamp(). Puntos fijos en px o rem sin clamp estan prohibidos en la escala tipografica publica.

## 4. Elevation

Este sistema es plano por decision. No hay box-shadows estructurales. La profundidad se comunica mediante tres mecanismos alternativos: jerarquia tipografica (tamano y peso), contraste de color entre superficie y contenido, y separacion espacial mediante los tokens de spacing fluid.

Los divisores Hairline (`rule` y `rule-strong`) son el unico elemento de separacion superficial — lineas de 1px a baja opacidad, nunca bordes gruesos ni sombras.

La unica excepcion al plano es la capa de `grain overlay` (z-index 999): una textura de ruido SVG sobre toda la pagina que da temperatura organica a las superficies. No es elevacion — es textura de papel.

### Reglas nombradas

**La Regla del Plano Absoluto.** Ningun elemento usa `box-shadow` como lenguaje de elevacion. Si algo necesita destacar, usa jerarquia tipografica o contraste de color, no sombra. Una sombra visible en este sistema es siempre un error de identidad.

**La Regla de la Hairline.** Los divisores son siempre de 1px. `border-width` superior a 1px como decoracion esta prohibido. El grosor comunica rigidez; la hairline comunica precision.

## 5. Components

### BrandMark
Componente de sistema con dos modos declarados. `variant="brand"`: muestra el logo SVG organico completo (identidad estatica, header, footer, favicon). `variant="mono"`: version monocromatica. El "motion mark" (flor geometrica de 8 petalos en BrandMark.astro) es el elemento de animacion del sistema — scroll-driven bloom, hover de 200 ms — y es distinto del asset SVG de branding. Prop `size` controla el tamano. Ver nota en Tipografia sobre la distincion identidad vs. motion mark.

### Container
Dos anchuras maximas: `narrow` (720 px) para texto largo y paginas de contenido; `wide` (1180 px) para layouts de seccion. Sin terceras opciones. Padding horizontal: `--spacing-section-x`.

### Section
Padding vertical por escala: `sm`, `md`, `lg`. Mapea a fracciones del token `--spacing-section-y`. No usar padding ad hoc fuera de esta escala.

### Eyebrow
JetBrains Mono, uppercase, `--text-eyebrow`, `ink-mute`. Siempre encima de un titulo, nunca solo. Verificar que `ink-mute` (55%) alcanza 4.5:1 sobre el fondo donde aparece.

### Emphasis (subrayado animado)
Subrayado teal dibujado via IntersectionObserver cuando el elemento entra en viewport. Color `teal-faint` como fondo del trazo. Prop `delay` para escalonar en grupos. La animacion usa `cubic-bezier(0.16, 1, 0.3, 1)`, 600 ms. Con `prefers-reduced-motion`, el subrayado aparece sin animacion, estato final inmediato.

### Hairline
Elemento `<hr>` estilizado. Por defecto usa `rule` (14% ink). Con prop `strong`, usa `rule-strong` (28% ink). Nunca mas grosor que 1px. Nunca color solido.

### FlorPersistente
`<aside>` con `position: fixed`, `bottom-right`, solo en home (`/`). Z-index 40 (debajo del header sticky). Es el motion mark en su contexto de identidad persistente. Hover a 200 ms.

### Navegacion (header sticky)
Z-index 50. Transicion de estado scroll (opaco/transparente) a 200-250 ms. Deteccion de pagina activa. En estado scrolled, fondo `paper-overlay`.

### Botones / CTA
No existe un componente Button formal de sistema en la implementacion actual. Los CTAs son elementos de texto con Emphasis o enlaces `<a>` con tipografia de cuerpo. No inventar un boton con `border-radius` y `box-shadow` — no corresponde a la estetica del sistema.

### Patrones de seccion (los 7 capitulos del home)

- **Hero**: H1 Giant Cormorant + subheading Newsreader lede + flor bloom scroll-driven. Pin con GSAP, scrub 0.8.
- **Declaracion (Cap 2)**: word-by-word reveal, pin 200vh, scrub:true.
- **VideoMask (Cap 3)**: sticky 200vh, mascara flor crece de 120px a 100vmax, scrub 0.5.
- **QueHacemos (Cap 4)**: grid 2x2 disciplinas, fondo paper.
- **Caso (Cap 5)**: fondo ink invertido, counter animado teal, scrub 0.4.
- **Como (Cap 6)**: 3 principios con Hairlines.
- **Manifiesto (Cap 7)**: pull-quote Cormorant centrado.
- **Contacto + Footer**: mailto mono, BrandMark.

## 6. Do's and Don'ts

### Do:
- **Do** usar `teal` (`#3BAA8C`) como el unico acento cromatico. Una sola voz cromatica es la doctrina del sistema.
- **Do** usar `paper` (`#F4F1EA`) como fondo base en todos los contextos de luz. Nunca `#FFFFFF`.
- **Do** medir el contraste de `teal` sobre `paper` antes de usarlo en texto: puede no alcanzar 4.5:1 WCAG AA para texto inferior a 18 pt. Usar `teal-deep` (`#2A8A70`) si no pasa.
- **Do** medir el contraste de `ink-mute` (55%) sobre `paper` antes de usarlo en texto de lectura: verificar 4.5:1. Usar `ink-mute-strong` (72%) si no pasa.
- **Do** mantener el rol de cada familia tipografica: Cormorant para display ceremonial, Newsreader para lectura serif, Inter para UI funcional, JetBrains para firma tecnica.
- **Do** usar la escala fluid (clamp) para todos los tamanos de fuente y espaciados de seccion. Sin breakpoints fijos.
- **Do** incluir `data-motion='reduced'` en el `<html>` cuando `prefers-reduced-motion` esta activo, y no inicializar Lenis ni GSAP en ese caso. La accesibilidad de motion es obligatoria (WCAG 2.2).
- **Do** preservar la distincion entre el logo SVG organico (identidad estatica) y el motion mark geometrico (elemento de animacion). Son dos cosas distintas.
- **Do** usar `--container-narrow` (720 px) para columnas de texto largo y `--container-wide` (1180 px) para layouts de seccion.
- **Do** easing `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) para todas las transiciones de reveal. Coherencia de curva en todo el sistema.

### Don't:
- **Don't** convertir este sistema en una agencia creativa ruidosa: sin gradientes decorativos, sin glassmorphism, sin neon, sin animaciones de relleno que no comuniquen nada. El movimiento existe para dirigir la atencion, no para demostrar que se puede.
- **Don't** convertir este sistema en una consultora corporativa fria: sin tipografia exclusivamente sans-serif con peso 300, sin layouts de rejilla simetrica con demasiado aire, sin lenguaje de "soluciones empresariales". La calidez humana es parte de la identidad.
- **Don't** usar `box-shadow` como lenguaje de elevacion. El sistema es plano. Una sombra visible es un error de identidad.
- **Don't** usar `#FFFFFF` como fondo. Solo `paper` (`#F4F1EA`) o sus derivados.
- **Don't** usar `teal` en texto de cuerpo sin verificar contraste. El acento no es un color de texto de uso general.
- **Don't** agregar una quinta familia tipografica. El sistema tiene cuatro con roles definidos. Una quinta es ruido.
- **Don't** usar puntos fijos de tamano de fuente en px sin clamp en elementos de la escala publica. La escala es siempre fluid.
- **Don't** reproducir el estetica de landing page de SaaS: sin hero con gradiente, sin tarjetas con sombra profunda, sin listas de features con checkmarks de colores, sin contador de clientes. Este sistema nombra situaciones reales, no conceptos genericos.
- **Don't** usar `border-width` superior a 1px como elemento decorativo. La hairline de 1px es el limite.
- **Don't** inicializar Lenis o GSAP cuando `prefers-reduced-motion` esta activo. No hay "animacion reducida alternativa" — hay estado final directo.
- **Don't** usar `night` (`#14201B`) en produccion hasta que el dark mode este disenado. Es un token reservado.
- **Don't** reemplazar el motion mark (flor geometrica) con el logo SVG organico en contextos de animacion scroll-driven. Son elementos diferentes con propositos diferentes.
