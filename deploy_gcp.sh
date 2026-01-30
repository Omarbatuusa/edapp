#!/bin/bash
# =============================================================================
# EdApp GCP Deployment Script
# Target: Google Cloud Compute Engine (africa-south1-b)
# =============================================================================

set -e

echo "=============================================="
echo "EdApp GCP Deployment"
echo "=============================================="

# Configuration
PROJECT_ID="edapp-prod"
ZONE="africa-south1-b"
VM_NAME="edapp-api-vm"
DEPLOY_DIR="/opt/edapp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Step 1: Pre-flight checks
# =============================================================================
log_info "Running pre-flight checks..."

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
fi

log_info "Pre-flight checks passed"

# =============================================================================
# Step 2: Stop existing containers
# =============================================================================
log_info "Stopping existing containers..."
cd $DEPLOY_DIR
docker compose down --remove-orphans || true

# =============================================================================
# Step 3: Pull latest code (if using git) or copy files
# =============================================================================
log_info "Updating deployment files..."
# Note: Files should already be copied to $DEPLOY_DIR before running this script

# =============================================================================
# Step 4: Build and start containers
# =============================================================================
log_info "Building and starting containers..."
docker compose build --no-cache
docker compose up -d

# =============================================================================
# Step 5: Wait for services to be healthy
# =============================================================================
log_info "Waiting for services to be healthy..."
sleep 30

# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# =============================================================================
# Step 6: Run database migrations (if needed)
# =============================================================================
log_info "Running database sync (TypeORM synchronize is enabled)..."
# TypeORM auto-syncs in development mode; for production consider migrations
# docker compose exec api npm run migration:run

# =============================================================================
# Step 7: Health checks
# =============================================================================
log_info "Running health checks..."

# API health
if curl -s -f http://localhost/v1 > /dev/null 2>&1; then
    log_info "API health check: PASSED"
else
    log_warn "API health check: FAILED (may still be starting)"
fi

# Frontend health
if curl -s -f http://localhost/ > /dev/null 2>&1; then
    log_info "Frontend health check: PASSED"
else
    log_warn "Frontend health check: FAILED (may still be starting)"
fi

echo ""
echo "=============================================="
log_info "Deployment complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Update Cloudflare DNS to point to this server's IP"
echo "2. Run the deployment proof report: ./deployment_proof.sh"
echo "3. Verify tenant routing works for all domains"
echo ""
