// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
// Note: In Astro 6, 'hybrid' was renamed to 'static' (same behavior).
// SSR pages opt-in via `export const prerender = false`.
export default defineConfig({
  // URL canonica del sitio: la usan el sitemap y las URLs absolutas.
  site: 'https://zanovix.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // sitemap: genera sitemap-index.xml para las rutas prerenderizadas. Excluye
  // las paginas de desarrollo (/dev/*), que no deben indexarse.
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/dev/') })],
  // La antigua "Auditoría AI Readiness" se promueve a /diagnostico (la puerta
  // del embudo). 301 permanente para preservar SEO y enlaces existentes.
  redirects: {
    '/servicios/auditoria-ai-readiness': {
      status: 301,
      destination: '/diagnostico',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  server: { host: true, port: 4321 },
  build: {
    inlineStylesheets: 'auto',
  },
  scopedStyleStrategy: 'attribute',
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
})
