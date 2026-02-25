#!/bin/bash
# =============================================================================
# EdApp Production Deployment Script
# Target: /opt/edapp on Google Cloud Compute Engine (edapp-api-vm)
# Usage: cd /opt/edapp && sudo bash deploy.sh
# =============================================================================

set -euo pipefail

echo "=============================================="
echo "    EdApp Deployment — $(date '+%Y-%m-%d %H:%M:%S')"
echo "=============================================="

DEPLOY_DIR="/opt/edapp"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

cd "$DEPLOY_DIR"

# ─────────────────────────────────────────────
# 1. Pre-flight checks
# ─────────────────────────────────────────────
echo ""
echo "▶ Step 1: Pre-flight checks"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE not found! Run CONFIG_SERVER_ENV.sh first."
    exit 1
fi
echo "  ✔ $ENV_FILE found"

if [ ! -f "firebase-service-account.json" ]; then
    echo "⚠️  firebase-service-account.json not found — API may fail to start"
fi

if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    echo "⚠️  SSL certificates missing in nginx/ssl/"
    echo "   Run CONFIG_SERVER_ENV.sh to create them, or copy Cloudflare Origin certs."
fi

# ─────────────────────────────────────────────
# 2. Pull latest code
# ─────────────────────────────────────────────
echo ""
echo "▶ Step 2: Pull latest code from GitHub"

if [ -d ".git" ]; then
    git fetch origin main
    git reset --hard origin/main
    echo "  ✔ Updated to latest main branch"
else
    echo "  ⚠ Not a git repo — skipping pull"
fi

# ─────────────────────────────────────────────
# 3. Stop existing containers
# ─────────────────────────────────────────────
echo ""
echo "▶ Step 3: Stop existing containers"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
echo "  ✔ Containers stopped"

# ─────────────────────────────────────────────
# 4. Build fresh images (no cache)
# ─────────────────────────────────────────────
echo ""
echo "▶ Step 4: Build Docker images (this may take 5-10 minutes)"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --no-cache

echo "  ✔ Images built"

# ─────────────────────────────────────────────
# 5. Start all containers
# ─────────────────────────────────────────────
echo ""
echo "▶ Step 5: Start containers"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
echo "  ✔ Containers starting..."

# ─────────────────────────────────────────────
# 6. Wait for health checks
# ─────────────────────────────────────────────
echo ""
echo "▶ Step 6: Waiting for services to become healthy..."
MAX_WAIT=120
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    # Check if API responds
    if curl -s -f http://localhost:3333/v1 > /dev/null 2>&1 || \
       docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T api wget -qO- http://localhost:3333/v1 > /dev/null 2>&1; then
        echo "  ✔ API is healthy"
        break
    fi
    echo "  ⏳ Waiting... ($ELAPSED/${MAX_WAIT}s)"
    sleep 10
    ELAPSED=$((ELAPSED + 10))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "  ⚠ API did not become healthy within ${MAX_WAIT}s"
    echo "  Check logs: docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs api --tail 50"
fi

# ─────────────────────────────────────────────
# 7. Show container status
# ─────────────────────────────────────────────
echo ""
echo "▶ Step 7: Container Status"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

# ─────────────────────────────────────────────
# 8. Quick smoke test
# ─────────────────────────────────────────────
echo ""
echo "▶ Step 8: Smoke Tests"

# Test via Nginx proxy
if curl -s -f http://localhost/ > /dev/null 2>&1; then
    echo "  ✔ Frontend responds on http://localhost/"
else
    echo "  ⚠ Frontend not responding (may need more startup time)"
fi

if curl -s -f http://localhost/v1/ > /dev/null 2>&1; then
    echo "  ✔ API responds on http://localhost/v1/"
else
    echo "  ⚠ API not responding via proxy (may need more startup time)"
fi

echo ""
echo "=============================================="
echo "✅ Deployment complete!"
echo "=============================================="
echo ""
echo "📊 Useful commands:"
echo "   docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs -f         # Follow all logs"
echo "   docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs api -f     # API logs only"
echo "   docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs web -f     # Web logs only"
echo "   docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs proxy -f   # Nginx logs"
echo "   docker compose --env-file $ENV_FILE -f $COMPOSE_FILE ps              # Container status"
echo "   docker compose --env-file $ENV_FILE -f $COMPOSE_FILE restart         # Restart all"
echo ""
