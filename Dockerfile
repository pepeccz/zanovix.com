# Usar una sola etapa para simplificar
FROM node:18-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Establecer variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Instalar dependencias y construir la aplicación
RUN npm install
RUN npm run build

# Exponer el puerto que Next.js utiliza
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]