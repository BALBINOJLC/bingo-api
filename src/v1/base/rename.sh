#!/bin/bash

# Solicitar la ruta del directorio
read -p "Introduce la ruta del directorio: " ruta

# Solicitar el nombre original y el nuevo nombre en singular y plural
read -p "Introduce el nombre original en singular (ejemplo: pack): " original_singular
read -p "Introduce el nombre original en plural (ejemplo: packs): " original_plural
read -p "Introduce el nuevo nombre en singular (ejemplo: pack): " nuevo_singular
read -p "Introduce el nuevo nombre en plural (ejemplo: packs): " nuevo_plural

# Cambiar al directorio proporcionado
cd "$ruta" || exit

# Realizar reemplazos en el contenido de los archivos en directorio y subdirectorios
find . -type f | while read -r archivo; do
    # Usar sed para reemplazar textos en el archivo
    sed -i "s/${original_singular^^}/${nuevo_singular^^}/g" "$archivo"
    sed -i "s/${original_singular^}/${nuevo_singular^}/g" "$archivo"
    sed -i "s/$original_singular/$nuevo_singular/g" "$archivo"
    sed -i "s/${original_plural^^}/${nuevo_plural^^}/g" "$archivo"
    sed -i "s/${original_plural^}/${nuevo_plural^}/g" "$archivo"
    sed -i "s/$original_plural/$nuevo_plural/g" "$archivo"
done

echo "Reemplazo en contenido de archivos completo."

# Realizar reemplazos en los nombres de los archivos en directorio y subdirectorios
find . -type f | while read -r archivo; do
    nuevo_archivo="${archivo//$original_singular/$nuevo_singular}"
    nuevo_archivo="${nuevo_archivo//$original_plural/$nuevo_plural}"
    if [[ "$archivo" != "$nuevo_archivo" ]]; then
        mv "$archivo" "$nuevo_archivo"
    fi
done

echo "Renombrado de archivos completo."
