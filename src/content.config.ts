/**
 * src/content.config.ts — Astro 6 Content Collections
 *
 * Ubicación canónica en Astro 6: src/content.config.ts
 * Requiere loader (glob o file) en lugar de type + schema.
 *
 * Colecciones definidas:
 *   - manifiesto: documento de visión (sincronizado manualmente desde ~/zanovix-os/)
 *
 * Sincronización: cp ~/zanovix-os/01-vision/manifiesto.md src/content/manifiesto/manifiesto.md
 * Tras sync: preservar frontmatter local si difiere, validar con `npx astro check`.
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

export const collections = {
  manifiesto,
}
