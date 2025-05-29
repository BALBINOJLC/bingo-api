#!/bin/bash

# Pedir la ruta y el nombre
echo "Por favor, ingresa la ruta:"
read ruta
echo "Por favor, ingresa el nombre (en plural):"
read nombre

# Crear la carpeta 'controllers' en la ruta especificada
mkdir -p "$ruta/controllers"

# Crear el archivo 'nombre.controller.ts' en la carpeta 'controllers'
touch "$ruta/controllers/${nombre}.controller.ts"

# Crear el archivo 'index.ts' en la carpeta 'controllers'
touch "$ruta/controllers/index.ts"

echo "export * from './${nombre}.controller';" >>"$ruta/controllers/index.ts"

# Crear la carpeta 'services' en la ruta especificada
mkdir -p "$ruta/services"

# Crear el archivo 'nombre.service.ts' en la carpeta 'services'
touch "$ruta/services/${nombre}.service.ts"

# Crear el archivo 'index.ts' en la carpeta 'services'
touch "$ruta/services/index.ts"

echo "export * from './${nombre}.service';" >>"$ruta/services/index.ts"

# Crear la carpeta 'dtos' en la ruta especificada
mkdir -p "$ruta/dtos"

# Crear el archivo 'nombre.dto.ts' en la carpeta 'dtos'
touch "$ruta/dtos/${nombre}.dto.ts"

# Crear el archivo 'index.ts' en la carpeta 'dtos'
touch "$ruta/dtos/index.ts"

echo "export * from './${nombre}.dto';" >>"$ruta/dtos/index.ts"

# Crear la carpeta 'interfaces' en la ruta especificada
mkdir -p "$ruta/interfaces"

# Crear el archivo 'nombre.interface.ts' en la carpeta 'interfaces'
touch "$ruta/interfaces/${nombre}.interface.ts"

# Crear el archivo 'index.ts' en la carpeta 'interfaces'
touch "$ruta/interfaces/index.ts"

echo "export * from './${nombre}.interface';" >>"$ruta/interfaces/index.ts"

# Crear la carpeta 'enums' en la ruta especificada
mkdir -p "$ruta/enums"

# Crear el archivo 'nombre.enum.ts' en la carpeta 'enums'
touch "$ruta/enums/${nombre}.enum.ts"

# Crear el archivo 'index.ts' en la carpeta 'enums'
touch "$ruta/enums/index.ts"

echo "export * from './${nombre}.enum';" >>"$ruta/enums/index.ts"

# Crear el archivo 'index.ts' en la raiz de la carpeta
touch "$ruta/index.ts"

echo "export * from './controllers';" >>"$ruta/index.ts"
echo "export * from './services';" >>"$ruta/index.ts"
echo "export * from './dtos';" >>"$ruta/index.ts"
echo "export * from './interfaces';" >>"$ruta/index.ts"
echo "export * from './enums';" >>"$ruta/index.ts"

# Crear el archivo 'module.ts' en la raiz de la carpeta
touch "$ruta/${nombre}.module.ts"

echo "Creado con éxito la carpeta y los archivos."
