#!/bin/bash
set -e

# --- CONFIGURATION ---
APP_DIR="/opt/edapp"
BACKUP_DIR="${APP_DIR}/_backup_$(date +%Y%m%d-%H%M%S)"
ZIP_FILE="edapp_final_deploy.zip"

echo ">>> Starting EdApp Deployment..."

# 1. PRE-CHECKS & BACKUP
echo ">>> Step 1: Creating Backups in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
[ -f "${APP_DIR}/docker-compose.yml" ] && cp "${APP_DIR}/docker-compose.yml" "$BACKUP_DIR/"
[ -f "${APP_DIR}/.env" ] && cp "${APP_DIR}/.env" "$BACKUP_DIR/"
[ -d "${APP_DIR}/nginx" ] && cp -r "${APP_DIR}/nginx" "$BACKUP_DIR/"

# 2. WRITE CLEAN DOCKER-COMPOSE.YML
echo ">>> Step 2: Writin Clean docker-compose.yml..."
cat > "${APP_DIR}/docker-compose.yml" <<EOF
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: edapp
      POSTGRES_USER: edapp
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks: [edapp]

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: ["redis-server","--appendonly","yes"]
    volumes:
      - redisdata:/data
    networks: [edapp]

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: .env
    depends_on: [postgres, redis]
    expose:
      - "3000"
    networks: [edapp]

  frontend:
    build:
      context: ./web
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: .env
    expose:
      - "5173"
    networks: [edapp]

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    depends_on: [backend, frontend]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    networks: [edapp]

networks:
  edapp:
    driver: bridge

volumes:
  pgdata:
  redisdata:
EOF

# 3. WRITE CLEAN NGINX CONFIG
echo ">>> Step 3: Writing Nginx Config..."
mkdir -p "${APP_DIR}/nginx"
cat > "${APP_DIR}/nginx/default.conf" <<EOF
map \$http_upgrade \$connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 80 default_server;
  server_name _;
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  server_name edapp.co.za *.edapp.co.za;

  ssl_certificate     /etc/nginx/certs/origin.pem;
  ssl_certificate_key /etc/nginx/certs/origin.key;
  ssl_protocols       TLSv1.2 TLSv1.3;

  client_max_body_size 50m;

  location /v1/ {
    proxy_pass http://backend:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  }

  location / {
    proxy_pass http://frontend:5173;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \$connection_upgrade;
  }
}

server {
  listen 443 ssl http2;
  server_name ~^apply-[a-z0-9-]+\.edapp\.co\.za$;

  ssl_certificate     /etc/nginx/certs/origin.pem;
  ssl_certificate_key /etc/nginx/certs/origin.key;
  ssl_protocols       TLSv1.2 TLSv1.3;

  client_max_body_size 50m;

  location /v1/ {
    proxy_pass http://backend:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  }

  location / {
    proxy_pass http://frontend:5173;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \$connection_upgrade;
  }
}
EOF

# 4. DEPLOY FRONTEND CODE
echo ">>> Step 4: Deploying Frontend Code..."
if [ -f "${APP_DIR}/${ZIP_FILE}" ]; then
  rm -rf "${APP_DIR}/web"
  mkdir -p "${APP_DIR}/web"
  unzip -q -o "${APP_DIR}/${ZIP_FILE}" -d "${APP_DIR}/web"
  echo "Frontend extracted."
else
  echo "ERROR: Zip file ${ZIP_FILE} not found in ${APP_DIR}!"
  exit 1
fi

# 5. REBUILD AND RESTART
echo ">>> Step 5: Building and Restarting Docker Containers..."
cd "${APP_DIR}"
# Rebuild frontend
docker compose build frontend
# Restart services
docker compose up -d --remove-orphans

# 6. VERIFICATION
echo ">>> Step 6: Verifying Deployment..."
sleep 5
docker compose ps
echo ">>> Nginx Logs (Tail):"
docker compose logs --tail=20 nginx

echo ">>> Deployment Complete! Check https://edapp.co.za"
