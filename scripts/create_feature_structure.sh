#!/bin/bash

# Pedir la ruta y el nombre de la característica
echo "Por favor, ingresa la ruta:"
read ruta
echo "Por favor, ingresa el nombre de la característica (en plural):"
read nombre

# Crear las carpetas y archivos base
mkdir -p "$ruta/features/$nombre"
mkdir -p "$ruta/features/$nombre/dtos"
mkdir -p "$ruta/features/$nombre/entities"
mkdir -p "$ruta/features/$nombre/repositories"
touch "$ruta/features/$nombre/${nombre}.controller.ts"
touch "$ruta/features/$nombre/${nombre}.module.ts"
touch "$ruta/features/$nombre/${nombre}.service.ts"
touch "$ruta/features/$nombre/dtos/${nombre}.dto.ts"
touch "$ruta/features/$nombre/entities/${nombre}.entity.ts"
touch "$ruta/features/$nombre/repositories/${nombre}.repository.ts"

echo "Estructura de característica '$nombre' creada con éxito en $ruta/features."
