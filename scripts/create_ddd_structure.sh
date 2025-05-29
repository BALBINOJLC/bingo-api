#!/bin/bash

# Pedir la ruta y el nombre de la característica
echo "Por favor, ingresa la ruta:"
read ruta
echo "Por favor, ingresa el nombre de la característica (en plural):"
read nombre

# Crear las carpetas base de la arquitectura DDD
mkdir -p "$ruta/$nombre/domain/entities"
mkdir -p "$ruta/$nombre/domain/repositories"
mkdir -p "$ruta/$nombre/infrastructure/datasources"
mkdir -p "$ruta/$nombre/infrastructure/repositories"
mkdir -p "$ruta/$nombre/application/services"
mkdir -p "$ruta/$nombre/presentation/controllers"
mkdir -p "$ruta/$nombre/presentation/dtos"

# Crear archivos base para cada capa
touch "$ruta/$nombre/domain/entities/${nombre}.entity.ts"
touch "$ruta/$nombre/domain/repositories/${nombre}.repository.ts"
touch "$ruta/$nombre/infrastructure/datasources/${nombre}.datasource.ts"
touch "$ruta/$nombre/infrastructure/repositories/${nombre}.repository.impl.ts"
touch "$ruta/$nombre/infrastructure/${nombre}.module.ts"
touch "$ruta/$nombre/application/services/${nombre}.service.ts"
touch "$ruta/$nombre/application/${nombre}.module.ts"
touch "$ruta/$nombre/presentation/controllers/${nombre}.controller.ts"
touch "$ruta/$nombre/presentation/dtos/${nombre}.dto.ts"
touch "$ruta/$nombre/presentation/${nombre}.module.ts"

echo "Estructura DDD para la característica '$nombre' creada con éxito en $ruta."
