# Usar una sola etapa para simplificar
FROM node:18-slim

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
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Instalar explícitamente autoprefixer y otras dependencias que puedan faltar
RUN npm install --save-dev autoprefixer postcss tailwindcss

# Construir la aplicación
RUN npm run build

# Establecer NODE_ENV a producción después de la construcción
ENV NODE_ENV=production

# Exponer el puerto que Next.js utiliza
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]