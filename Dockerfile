# Etapa de construcción
FROM node:18-slim AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Instalar dependencias globales necesarias
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de configuración de dependencias primero
COPY package.json package-lock.json* ./

# Instalar todas las dependencias, incluyendo las de desarrollo
RUN npm install --include=dev

# Copiar el resto del código fuente
COPY . .

# Establecer variables de entorno
ENV NEXT_TELEMETRY_DISABLED=1

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-slim AS runner

WORKDIR /app

# Establecer variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copiar los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Exponer el puerto que Next.js utiliza
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]