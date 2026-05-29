# Guía de Despliegue para Zanovix AI Website

Este documento proporciona instrucciones detalladas para desplegar la aplicación web de Zanovix AI en un entorno de producción utilizando Docker.

## Requisitos Previos

- Docker instalado en el servidor de producción
- Acceso a Internet desde el servidor
- Permisos para ejecutar comandos Docker
- Opcionalmente: un dominio configurado para apuntar al servidor

## Nota Importante sobre la Configuración

Esta aplicación utiliza la configuración `output: 'standalone'` de Next.js, lo que significa que:

1. La aplicación se ejecuta con `node server.js` en lugar de `next start`
2. El Dockerfile está configurado para copiar los archivos necesarios desde la carpeta `.next/standalone`
3. No es necesario tener todas las dependencias de desarrollo en la imagen de producción

## Opciones de Despliegue

### Opción 1: Despliegue en Servidor Propio

#### 1. Descargar la Imagen Docker

```bash
docker pull pepeccz/zanovixai-website:latest
```

#### 2. Ejecutar el Contenedor

```bash
docker run -d -p 80:3000 --restart always --name zanovix-web pepeccz/zanovixai-website:latest
```

Parámetros:
- `-d`: Ejecuta el contenedor en segundo plano
- `-p 80:3000`: Mapea el puerto 80 (HTTP) del servidor al puerto 3000 del contenedor
- `--restart always`: Reinicia automáticamente el contenedor si se detiene
- `--name zanovix-web`: Asigna un nombre al contenedor para facilitar su gestión

#### 3. Verificar que el Contenedor está Funcionando

```bash
docker ps
```

Deberías ver el contenedor `zanovix-web` en la lista de contenedores en ejecución.

#### 4. Configurar HTTPS (Recomendado)

Para configurar HTTPS con Let's Encrypt:

1. Instalar Certbot:
   ```bash
   apt-get update
   apt-get install certbot
   ```

2. Obtener certificado:
   ```bash
   certbot certonly --standalone -d tudominio.com
   ```

3. Configurar un proxy inverso (Nginx o similar) para manejar HTTPS.

### Opción 2: Despliegue en Servicios en la Nube

#### Despliegue en DigitalOcean App Platform

1. Crear una cuenta en DigitalOcean
2. Crear una nueva aplicación en App Platform
3. Seleccionar "Docker Hub" como fuente
4. Ingresar `pepeccz/zanovixai-website:latest` como imagen
5. Configurar el puerto HTTP como 3000
6. Completar la configuración y desplegar

#### Despliegue en Render

1. Crear una cuenta en Render
2. Crear un nuevo servicio web
3. Seleccionar "Docker Image" como tipo de servicio
4. Ingresar `pepeccz/zanovixai-website:latest` como imagen
5. Configurar el puerto como 3000
6. Completar la configuración y desplegar

## Mantenimiento

### Actualizar la Aplicación

Cuando haya cambios en la aplicación:

1. Construir una nueva imagen:
   ```bash
   docker build -t pepeccz/zanovixai-website:latest .
   ```

2. Subir la imagen a Docker Hub:
   ```bash
   docker push pepeccz/zanovixai-website:latest
   ```

3. En el servidor de producción:
   ```bash
   docker pull pepeccz/zanovixai-website:latest
   docker stop zanovix-web
   docker rm zanovix-web
   docker run -d -p 80:3000 --restart always --name zanovix-web pepeccz/zanovixai-website:latest
   ```

### Monitoreo

#### Ver Logs del Contenedor

```bash
docker logs zanovix-web
```

Para seguir los logs en tiempo real:

```bash
docker logs -f zanovix-web
```

#### Verificar el Estado del Contenedor

```bash
docker stats zanovix-web
```

## Solución de Problemas

### El Contenedor se Detiene Inesperadamente

1. Verificar los logs:
   ```bash
   docker logs zanovix-web
   ```

2. Reiniciar el contenedor:
   ```bash
   docker restart zanovix-web
   ```

### La Aplicación No Responde

1. Verificar si el contenedor está en ejecución:
   ```bash
   docker ps | grep zanovix-web
   ```

2. Verificar si el puerto está correctamente mapeado:
   ```bash
   docker port zanovix-web
   ```

3. Verificar la conectividad al puerto:
   ```bash
   curl http://localhost:80
   ```

## Backup y Restauración

La aplicación es principalmente estática, pero si hay datos que necesitan ser respaldados:

1. Crear un volumen para datos persistentes:
   ```bash
   docker run -d -p 80:3000 -v zanovix_data:/app/data --restart always --name zanovix-web pepeccz/zanovixai-website:latest
   ```

2. Respaldar el volumen:
   ```bash
   docker run --rm -v zanovix_data:/data -v $(pwd):/backup alpine tar -zcvf /backup/zanovix_data_backup.tar.gz /data
   ```

3. Restaurar el volumen:
   ```bash
   docker run --rm -v zanovix_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar -zxvf /backup/zanovix_data_backup.tar.gz --strip 1"
   ```

## Contacto y Soporte

Para soporte técnico, contactar a:
- Email: soporte@zanovix.ai
- Teléfono: +34 XXX XXX XXX
