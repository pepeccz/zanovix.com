---
title: "Ejemplo de plantilla (no es un caso real)"
slug: ejemplo-plantilla
sector: "Demostración"
zona: "Málaga"
year: 2026
summary: "Entrada de demostración para validar la plantilla de caso. No describe ningún cliente, proyecto ni resultado real."
services:
  - "Auditoría AI Readiness"
  - "Diseño y desarrollo web, con GEO"
problem: "Esta entrada existe solo para comprobar cómo se ve un caso renderizado: cabecera, problema, desarrollo, resultados y testimonio. Cuando exista un caso real, este fichero se borra."
approach: "Se rellenan todos los campos del schema con texto de muestra rotulado como demostración, para revisar la composición sin publicar nada en producción."
results: "No hay resultados reales. Este bloque solo demuestra dónde irían las cifras honestas de un caso real, con su contexto y método de medición."
testimonial:
  quote: "Este testimonio es de muestra y no corresponde a ninguna persona real. Sirve para ver el bloque destacado en la plantilla."
  author: "Persona de ejemplo"
  role: "Cargo de ejemplo"
order: 999
draft: true
---

## Por qué este fichero existe

Esta es una entrada de **demostración de plantilla**, no un caso real. Tiene
`draft: true`, así que:

- El build de producción la **excluye**: no se genera la página `/casos/ejemplo-plantilla`.
- **Nunca aparece** en el índice `/casos` publicado.
- Solo es visible en `astro dev` (modo desarrollo) para validar el render.

Cuando exista un caso real, este fichero se elimina.

## Cómo se cuenta un caso real

El cuerpo markdown lleva el desarrollo largo del caso, por fases, con
encabezados. Aquí va el **qué se hizo, de qué manera y por qué**.

### Discovery

Qué miramos antes de proponer nada: cómo trabajaba el cliente, dónde se le iban
las horas y dónde dejaban de encontrarle. Sin asumir que la IA era la respuesta.

### Propuesta y línea base

Qué plan se acordó, por qué se empezó por ahí y qué línea base se midió antes de
tocar nada, para saber de dónde se partía.

### Ejecución medida

Cómo se construyó en tramos cortos, comprobando contra la base medida, no contra
una promesa.

### Entrega documentada

Qué quedó funcionando y, sobre todo, el razonamiento por escrito: qué se
decidió, qué se midió y qué sigue.
