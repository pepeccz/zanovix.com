/**
 * src/content.config.ts — Astro 6 Content Collections
 *
 * Ubicación canónica en Astro 6: src/content.config.ts
 * Requiere loader (glob o file) en lugar de type + schema.
 *
 * Colecciones definidas:
 *   - manifiesto: documento de visión (sincronizado manualmente desde ~/zanovix-os/)
 *   - casos: portfolio, una página por caso (cada .md/.mdx es un caso)
 *
 * Sincronización manifiesto: cp ~/zanovix-os/01-vision/manifiesto.md src/content/manifiesto/manifiesto.md
 * Tras sync: preservar frontmatter local si difiere, validar con `npx astro check`.
 *
 * ── Cómo añadir un caso real ───────────────────────────────────────────────
 * 1. Crea un archivo en src/content/casos/<slug>.md (o .mdx). El nombre del
 *    fichero es el slug por defecto (puede sobrescribirse con `slug` en el
 *    frontmatter).
 * 2. Rellena el frontmatter (ver schema `casos` abajo). Honestidad nº1: solo
 *    datos reales, con permiso. `results`/`testimonial` son OPCIONALES; no
 *    fuerces números. Los testimonios solo con permiso explícito del cliente.
 * 3. El cuerpo markdown es el desarrollo largo del caso (qué se hizo, cómo y
 *    por qué), con encabezados (##, ###). Lo renderiza la plantilla de detalle.
 * 4. Deja `draft: false` (o quítalo: el default es false) para publicarlo. El
 *    índice /casos lo listará y se generará su página /casos/<slug>.
 * 5. Un caso con `draft: true` NO se publica en producción ni aparece en el
 *    índice; solo es visible en `astro dev` para validar la plantilla.
 */
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'zod'

const manifiesto = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/manifiesto' }),
  schema: z.object({
    title: z.string(),
    updated: z.string().optional(),
  }),
})

/**
 * Colección `casos` — portfolio, una página por caso.
 *
 * El cuerpo markdown lleva el desarrollo largo (qué / cómo / por qué) por
 * fases, con encabezados. El frontmatter aporta la metadata estructurada.
 */
const casos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/casos' }),
  schema: z.object({
    /** Título del caso (cabecera de la página). */
    title: z.string(),
    /** Slug opcional; si se omite, se usa el nombre del fichero. */
    slug: z.string().optional(),
    /** Sector del cliente (p.ej. "Hostelería", "Retail"). */
    sector: z.string(),
    /** Zona / ubicación (p.ej. "Málaga", "Vigo"). */
    zona: z.string().optional(),
    /** Año o fecha del proyecto. Acepta número (2026) o texto ("2026"). */
    year: z.union([z.number(), z.string()]).optional(),
    /** Resumen de 1-2 frases para el índice y la cabecera. */
    summary: z.string(),
    /**
     * Servicios implicados. Referencian la colección `servicios` cuando exista;
     * por ahora son etiquetas de texto libre (los servicios viven en .astro,
     * no en colección). Mantener el array por si se migran a colección.
     */
    services: z.array(z.string()).default([]),
    /** El "por qué": el dolor real del cliente antes de empezar. */
    problem: z.string(),
    /**
     * El "cómo / qué se hizo", resumido. El desarrollo largo por fases va en el
     * cuerpo markdown del fichero. Este campo es la versión corta para cabecera.
     */
    approach: z.string().optional(),
    /**
     * Resultados honestos. Texto libre, SIN obligar números. Omitir si no hay
     * cifras reales atribuibles. Nunca inventar.
     */
    results: z.string().optional(),
    /** Testimonio destacado. Solo con permiso explícito del cliente. */
    testimonial: z
      .object({
        quote: z.string(),
        author: z.string(),
        role: z.string().optional(),
      })
      .optional(),
    /** Imagen de portada opcional (ruta pública o import). */
    cover: z.string().optional(),
    /** Orden en el índice (menor = antes). Default alto para que vaya al final. */
    order: z.number().default(100),
    /** draft:true => NO se publica en producción ni en el índice. */
    draft: z.boolean().default(false),
  }),
})

export const collections = {
  manifiesto,
  casos,
}
