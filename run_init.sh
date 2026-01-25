#!/bin/bash
cd /opt/edapp/deployment_config

echo ">>> Stopping conflicting services..."
systemctl stop nginx || true
systemctl stop apache2 || true
fuser -k 80/tcp || true

echo ">>> Starting Nginx Container..."
docker compose up -d nginx

echo ">>> Waiting for DB..."
sleep 10

echo ">>> Initializing Database..."
# Use the uploaded SQL file directly if possible, or cat it
docker compose exec -T postgres psql -U edapp -d edapp -f /app/backend/db/init_db_prod.sql || \
cat ../backend/db/init_db_prod.sql | docker compose exec -T postgres psql -U edapp -d edapp

echo ">>> Done."
