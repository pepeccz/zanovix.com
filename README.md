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

## Run with Docker

### Desarrollo local (smoke test)

```bash
# Construir la imagen
docker build -t zanovix-com:local .

# Levantar el contenedor
docker run --rm -d -p 3000:3000 --name znx-local zanovix-com:local

# Verificar
curl http://localhost:3000/   # debe responder 200 con HTML

# Parar
docker stop znx-local
```

### Con docker compose

```bash
docker compose up --build     # construye y levanta
docker compose down           # para y elimina el contenedor
```

El servicio queda en `http://localhost:3000`.

### Producción

La imagen se construye con la misma `Dockerfile` multistage:

1. Stage `builder` — instala deps + ejecuta `npm run build`
2. Stage `runner` — imagen final: solo `dist/` + prod deps, usuario no-root (`astro` uid 1001)

Variables de entorno requeridas en el host de producción:

```
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
```

El servidor Astro Node standalone arranca con:
```bash
node ./dist/server/entry.mjs
```

No requiere nginx ni proxy adicional para servir el sitio.

---

## Documentación viva

- Brand canon: `~/zanovix-os/10-branding/DESIGN.md`
- Tesis estratégica: `~/zanovix-os/02-strategy/tesis-v0-wip.md`
- Manifiesto: `~/zanovix-os/01-vision/manifiesto.md`
- Catálogo de servicios (no público): `~/zanovix-os/03-services/`
