# Etapa de construcción
FROM node:18-slim AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Establecer variables de entorno para la construcción
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Construir la aplicación Next.js
RUN npm run build

# Etapa de producción
FROM node:18-slim AS runner

# Establecer el directorio de trabajo
WORKDIR /app

# Establecer variables de entorno para producción
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear un usuario no root para ejecutar la aplicación
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar el directorio .next de manera especial para preservar permisos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no root
USER nextjs

# Exponer el puerto que Next.js utiliza
EXPOSE 3000

# Establecer la variable de host para que Next.js escuche en todas las interfaces
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]