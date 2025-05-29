#!/bin/bash

# Comprueba si se proporcionaron los argumentos correctos
if [ "$#" -ne 3 ]; then
    echo "Uso: $0 your_domain port email"
    exit 1
fi

# Asigna los argumentos a variables
DOMAIN=$1
PORT=$2
EMAIL=$3

# Crea el archivo de configuración para el virtual host
sudo bash -c "cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF"

# Elimina el enlace simbólico existente si existe
if [ -L "/etc/nginx/sites-enabled/$DOMAIN" ]; then
    sudo rm /etc/nginx/sites-enabled/$DOMAIN
fi

# Crea un enlace simbólico al archivo de configuración
sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Comprueba la sintaxis de la configuración de Nginx
sudo nginx -t

# Reinicia Nginx
sudo systemctl restart nginx

echo "Virtual host creado para el dominio $DOMAIN en el puerto $PORT"

# Instala el certificado SSL con Certbot
sudo certbot --nginx -d $DOMAIN --agree-tos --no-eff-email --email $EMAIL --redirect

echo "Certificado SSL instalado para el dominio $DOMAIN"