# syntax=docker/dockerfile:1.7

# ── Builder ────────────────────────────────────────────────────────────────────
# Instala deps y construye el proyecto Astro.
# Node 22 slim — sin Python/make/g++ (Astro/GSAP/Lenis son JS puro, no native addons).
FROM node:22-slim AS builder
WORKDIR /app

# Cache de deps: copiar manifests antes del source
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

# Copiar source y compilar
COPY . .
RUN npm run build

# ── Runner ────────────────────────────────────────────────────────────────────
# Imagen de producción: solo dist/ + prod deps. Sin código fuente.
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

# Deps de producción únicamente (omit=dev)
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit --no-fund \
 && npm cache clean --force

# Artefacto de build: dist/server/entry.mjs + dist/client/
COPY --from=builder /app/dist ./dist

# Usuario no-root (seguridad estándar)
RUN useradd --system --uid 1001 astro \
 && chown -R astro:astro /app
USER astro

EXPOSE 3000

# Healthcheck con fetch() nativo Node 22 (no requiere curl/wget en slim)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" || exit 1

CMD ["node", "./dist/server/entry.mjs"]
