#!/bin/bash
set -e

echo "Starting Deployment Script..."

# 1. Stop existing containers
echo "Stopping containers..."
cd /opt/edapp/deployment_config || true
docker compose -p edapp down || true
cd /opt/edapp

# 2. Clean old files
echo "Cleaning old files..."
rm -rf backend web deployment_config

# 3. Unpack new bundle
echo "Unpacking new bundle..."
tar -xzf bundle.tar.gz
rm bundle.tar.gz

# Restore .env
echo "Restoring .env..."
cp /opt/edapp/.env /opt/edapp/deployment_config/.env

# 4. Rebuild and Start
echo "Rebuilding containers..."
cd deployment_config
docker compose -p edapp up -d --build

# 5. Wait for DB
echo "Waiting for Database..."
sleep 15

# 6. Migrate Schema
# echo "Migrating Schema..."
# docker cp /opt/edapp/backend/db/schema_v2.sql deployment_config-postgres-1:/tmp/schema.sql
# docker exec deployment_config-postgres-1 psql -U edapp -d edapp -f /tmp/schema.sql

# echo "Migrating RBAC Schema..."
# docker cp /opt/edapp/backend/db/schema_rbac.sql deployment_config-postgres-1:/tmp/schema_rbac.sql
# docker exec deployment_config-postgres-1 psql -U edapp -d edapp -f /tmp/schema_rbac.sql

# docker cp /opt/edapp/backend/db/seed_rbac.sql deployment_config-postgres-1:/tmp/seed_rbac.sql
# docker exec deployment_config-postgres-1 psql -U edapp -d edapp -f /tmp/seed_rbac.sql

echo "Deployment Script Complete!"
