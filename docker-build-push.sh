#!/bin/bash

# Configuración
IMAGE_NAME="zanovix/studio"
TAG="latest"

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando construcción de la imagen Docker para Zanovix Studio...${NC}"

# Construir la imagen Docker
echo -e "${YELLOW}Paso 1: Construyendo la imagen Docker...${NC}"
docker build -t $IMAGE_NAME:$TAG .

# Verificar si la construcción fue exitosa
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Imagen construida exitosamente: $IMAGE_NAME:$TAG${NC}"
else
    echo -e "${RED}✗ Error al construir la imagen Docker${NC}"
    exit 1
fi

# Preguntar si se desea subir la imagen a Docker Hub
echo -e "${YELLOW}¿Deseas subir la imagen a Docker Hub? (s/n)${NC}"
read respuesta

if [ "$respuesta" = "s" ] || [ "$respuesta" = "S" ]; then
    # Iniciar sesión en Docker Hub
    echo -e "${YELLOW}Paso 2: Iniciando sesión en Docker Hub...${NC}"
    echo -e "${YELLOW}Por favor, ingresa tus credenciales de Docker Hub:${NC}"
    docker login

    # Verificar si el inicio de sesión fue exitoso
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Inicio de sesión exitoso${NC}"
        
        # Subir la imagen a Docker Hub
        echo -e "${YELLOW}Paso 3: Subiendo imagen a Docker Hub...${NC}"
        docker push $IMAGE_NAME:$TAG
        
        # Verificar si la subida fue exitosa
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Imagen subida exitosamente a Docker Hub: $IMAGE_NAME:$TAG${NC}"
            echo -e "${GREEN}✓ Puedes descargarla con: docker pull $IMAGE_NAME:$TAG${NC}"
        else
            echo -e "${RED}✗ Error al subir la imagen a Docker Hub${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Error al iniciar sesión en Docker Hub${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Omitiendo la subida a Docker Hub${NC}"
fi

echo -e "${GREEN}¡Proceso completado!${NC}"
