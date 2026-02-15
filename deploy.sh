#!/bin/bash
# EdApp Multi-Tenant Deployment Script
# Run this on the OCI server after SSH

set -e

echo "🚀 EdApp Multi-Tenant Deployment"
echo "================================="

# Navigate to project directory
cd /opt/edapp || mkdir -p /opt/edapp && cd /opt/edapp

# Verify environment file exists
if [ ! -f .env.production ]; then
    echo "⚠️ .env.production file not found!"
    exit 1
fi
echo "✓ Found .env.production"

# Stop existing containers
echo "📦 Stopping existing containers..."
docker compose --env-file .env.production -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Pull latest code from GitHub
echo "📥 Pulling latest code..."
if [ -d ".git" ]; then
    git fetch origin main
    git reset --hard origin/main
else
    git clone https://github.com/Omarbatuusa/edapp.git .
fi

# Build and start containers
echo "🔨 Building containers..."
docker compose --env-file .env.production -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting containers..."
docker compose --env-file .env.production -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run database seed
echo "🌱 Running database seed..."
docker compose --env-file .env.production -f docker-compose.prod.yml exec api npm run seed:prod || docker compose --env-file .env.production -f docker-compose.prod.yml exec api npx ts-node src/database/seed.ts

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔐 Admin Credentials:"
echo "   - umarbatuusa@gmail.com / Janat@2000"
echo "   - admin@edapp.co.za / Janat@2000"
echo ""
echo "🏫 School Codes:"
echo "   - RAI01 (Rainbow City Schools)"
echo "   - ALL01 (Allied Schools)"
echo "   - LIA01 (Lakewood International Academy)"
echo "   - JEP01 (Jeppe Education Centre)"
echo ""
echo "🌐 Domains:"
echo "   - https://app.edapp.co.za (Discovery)"
echo "   - https://rainbow.edapp.co.za"
echo "   - https://allied.edapp.co.za"
echo "   - https://lia.edapp.co.za"
echo "   - https://jeppe.edapp.co.za"
echo ""
echo "📊 Check logs: docker compose logs -f"
