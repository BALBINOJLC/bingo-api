#!/bin/bash

echo "Seleccione la base de datos:"
echo "1) PostgreSQL"
echo "2) MongoDB"
read db_choice

case $db_choice in
  1)
    docker-compose -f docker-compose.yml -f docker-compose.postgres.yml up
    ;;
  2)
    docker-compose -f docker-compose.yml -f docker-compose.mongo.yml up
    ;;
  *)
    echo "Opción no válida."
    ;;
esac
