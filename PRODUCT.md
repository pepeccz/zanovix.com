# Product

## Register

brand

## Users

Comprador **dual**, hoy a menudo encarnado en la misma persona:

- **Campeón (lector principal de la web):** dueño o gerente de una pyme española
  (5-50 empleados, facturación 200k-3M€). Siente el dolor en carne propia y navega la
  web buscando solución. Su contexto emocional: miedo a invertir en algo que fracase y
  quede en evidencia ante su equipo o sus socios. A futuro este rol será un directivo
  (IT, innovación, marketing) de una empresa mayor.
- **Comprador económico:** el mismo dueño hoy; a futuro, el CEO que aprueba el
  presupuesto. Decide con la cabeza: necesita prueba, ROI y mitigación de riesgo.

**Job-to-be-done:** no quieren "comprar IA". Quieren dejar de perder clientes que ya
no los encuentran (porque preguntan a ChatGPT y no aparecen) y dejar de quemar horas
respondiendo siempre lo mismo. Contratan un resultado, no una tecnología.

## Product Purpose

Web de captación de leads de Zanovix, empresa de **IA aplicada** a pyme. Objetivo:
convertir visitantes en leads de calidad **precalificados**. El diferencial es un
asistente IA que acompaña al visitante, le da valor primero (mini-diagnóstico) y
precalifica (sector, dolor, urgencia, presupuesto, poder de decisión) mientras el
propio uso del asistente **demuestra el producto en vivo**.

Posicionamiento **Puente**: vende lo entregable hoy (IA aplicada a pyme, GEO como
punta de lanza) con honestidad total sobre el track record, pero con arquitectura y
narrativa que escalan a enterprise sin rehacerse.

Éxito = leads precualificados que llegan ya "educados" sobre el problema y con munición
para justificar la inversión internamente.

## Brand Personality

**Pausada. Honesta. Artesana.** (Rigor de ingeniería + calidez humana, sin humo.)

- **Voz:** castellano peninsular, trato de "tú", sin voseo. Frases cortas con peso.
  Anti-hype: si suena a buzzword, se busca otra palabra. Si algo es hipótesis, se dice.
- **Dos capas de marca:** "IA aplicada" (categoría: qué somos, claridad + SEO/GEO) +
  "Ingeniería pausada con IA" (firma: por qué nosotros, diferenciador ownable). Van
  juntas.
- **Substancia:** bajar la IA a una aplicación **real** (no humo), **sostenible** (no
  fuego de artificio) y **eficaz** (resultados).
- **Emociones a evocar:** confianza por competencia demostrada, calma frente al ruido
  del sector, cercanía de "hay personas detrás, no una máquina".

## Anti-references

Lo que esta web NO debe parecer:

- **Agencia creativa ruidosa:** animaciones por todas partes, neón, efectos que
  distraen del mensaje. El ruido por encima de la substancia traiciona "ingeniería
  pausada". El motion existe, pero sirve a la narrativa, nunca la tapa.
- **Consultora corporativa fría:** fotos de stock, azul corporativo, texto vacío,
  sensación impersonal. Justo lo contrario de "no somos consultora" y de la calidez que
  pide el comprador pyme.

(No es ni gritona ni distante: editorial cálida, el punto medio.)

Además, vetos transversales de marca: SaaS genérico (gradientes morados, hero-métrica,
cards idénticas) y hype tech/crypto (promesas grandilocuentes, glassmorphism decorativo)
quedan fuera por incompatibles con la voz anti-hype.

## Design Principles

1. **El medio es el mensaje.** La propia web demuestra lo que vendemos: el asistente IA
   precalifica en vivo. Practicamos lo que predicamos; no lo contamos, se experimenta.
2. **Honestidad sobre humo.** Nada de promesas grandilocuentes ni números prestados. Si
   algo es hipótesis o está en progreso, se dice. La honestidad ES el diferenciador en
   un sector saturado de vendedores de motos.
3. **Claridad antes que decoración.** Cada sección responde una objeción o avanza la
   decisión del comprador. Si un elemento solo es bonito, sobra.
4. **Nombrar situaciones, no conceptos.** Hablamos de momentos reales del cliente
   (preguntar a ChatGPT, contestar lo mismo 80 veces) en vez de abstracciones de
   folleto.
5. **Rigor con calidez.** Competencia de ingeniería y cercanía humana a la vez: ni ruido
   de agencia ni frialdad de consultora. Un artesano experto que te habla de tú.

## Accessibility & Inclusion

Estándar del proyecto: **WCAG 2.2 AA**.

- Contraste ≥4.5:1 en texto de cuerpo, ≥3:1 en texto grande. Verificar especialmente
  los grises sobre fondos tintados (el fallo más común).
- Navegación por teclado completa y foco visible.
- `prefers-reduced-motion`: alternativa (crossfade o transición instantánea) para todo
  el sistema de motion scroll-driven. No opcional.
- Las animaciones de revelado deben realzar contenido ya visible por defecto, nunca
  ocultarlo tras una clase (si el JS no dispara, la sección no debe quedar en blanco).
