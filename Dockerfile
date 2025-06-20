# Start of Selection
# Dependencias
FROM node:21-alpine3.19 AS deps

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

# Builder - Construye la aplicación
FROM node:21-alpine3.19 AS build

WORKDIR /usr/src/app

# Copiar de deps, los módulos de node
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copiar todo el código fuente de la aplicación
COPY . .

# Generar el cliente Prisma
RUN yarn prisma generate

# Instalar dependencias necesarias para Puppeteer
RUN apk add --no-cache udev

# Construir la aplicación con Yarn
RUN yarn build

# Instalar dependencias de producción y limpiar la caché de Yarn
RUN yarn install --production --ignore-scripts --prefer-offline && yarn cache clean

# Crear la imagen final de Docker para producción
FROM node:21-alpine3.19 AS prod

WORKDIR /usr/src/app

# Copiar los módulos de node y la carpeta de dist desde la etapa de construcción
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Instalar Doppler CLI y Chromium para Puppeteer
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler chromium

# Set environment variable for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Crear un directorio temporal y establecer permisos
RUN mkdir -p /usr/src/app/tmp && chown -R node:node /usr/src/app/tmp

ENV NODE_ENV=staging

# Cambiar a usuario no root por razones de seguridad
USER node

# Exponer el puerto en el que la app se ejecuta
EXPOSE 3025

# Ajustar la ruta del archivo main.js
CMD ["doppler", "run", "--", "node", "dist/src/main.js"]
# End of Selection
