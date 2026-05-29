// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
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
