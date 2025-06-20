#!/bin/bash

#bash ./scripts/build_and_run.bash ./Dockerfile api

# Variables
DOCKER_USERNAME="balbinojose"
PREFIX="bingo_"
DOCKERFILE=$1
SERVICE=$2

# Verificar que se han proporcionado el Dockerfile y el nombre del servicio
if [ -z "$DOCKERFILE" ] || [ -z "$SERVICE" ]; then
  echo "Por favor, proporciona la ruta al Dockerfile y el nombre del servicio como parámetros."
  echo "Uso: $0 <ruta_al_dockerfile> <nombre_del_servicio>"
  exit 1
fi

# Construir la imagen Docker usando el Dockerfile proporcionado
 docker build --platform linux/amd64 -f $DOCKERFILE -t $SERVICE:latest .

# Etiquetar la imagen con el prefijo
IMAGE_TAG="$DOCKER_USERNAME/$PREFIX$SERVICE:latest"
docker tag $SERVICE:latest $IMAGE_TAG

# Subir la imagen a Docker Hub
docker push $IMAGE_TAG