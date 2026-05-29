# zanovix.com

Sitio web institucional de Zanovix — IA aplicada a empresas.

> **Estado:** v2, en construcción. Stack: Astro 5 + Node adapter + Docker.
> El v0 anterior (Next.js 15 + Shadcn) vive en la branch `archive/v0-shadcn-landing`.

## Para qué sirve

Punto de entrada público de Zanovix. Comunica posicionamiento, manifiesto, casos
y bitácora. No vende servicios directamente — los servicios viven en páginas
internas o se acuerdan en conversación tras el primer contacto.

## Estructura de fases (SDD)

1. **DISEÑO** — sistema de marca + motion + hero (en curso)
2. **FUNCIONALIDAD** — formulario contacto, blog/bitácora, navegación
3. **CONTENIDO** — migración de copy desde `~/zanovix-os/`
4. **SEO / GEO / SEM** — schema, sitemap, OG, llms.txt, landings de ads

## Comandos

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # ./dist/
npm run preview  # serve dist/
```

## Carpetas reservadas

- `src/` — código fuente Astro
- `public/` — assets estáticos
- `legacy/` — Docker setup del v0 (referencia para adaptar al adapter Node)
- `.astro/` — generado, no commitear

## Documentación viva

- Brand canon: `~/zanovix-os/10-branding/DESIGN.md`
- Tesis estratégica: `~/zanovix-os/02-strategy/tesis-v0-wip.md`
- Manifiesto: `~/zanovix-os/01-vision/manifiesto.md`
- Catálogo de servicios (no público): `~/zanovix-os/03-services/`
