#!/bin/bash
# =============================================================================
# EdApp GCP Infrastructure Setup Script
# Run this ONCE on the VM to set up firewall and base configuration
# =============================================================================

set -e

echo "=============================================="
echo "EdApp GCP Infrastructure Setup"
echo "=============================================="

# Configuration
PROJECT_ID="edapp-prod"
ZONE="africa-south1-b"
VM_NAME="edapp-api-vm"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# =============================================================================
# Step 1: Configure UFW Firewall
# =============================================================================
log_info "Configuring UFW firewall..."

# Reset UFW to defaults
sudo ufw --force reset

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (restricted to specific IPs if needed)
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Enable UFW
sudo ufw --force enable

log_info "UFW firewall configured"
sudo ufw status verbose

# =============================================================================
# Step 2: Create deployment directory
# =============================================================================
log_info "Creating deployment directory..."

sudo mkdir -p /opt/edapp
sudo chown $USER:$USER /opt/edapp

log_info "Deployment directory created at /opt/edapp"

# =============================================================================
# Step 3: Install Docker if not present
# =============================================================================
if ! command -v docker &> /dev/null; then
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log_info "Docker installed. You may need to log out and back in for group changes."
else
    log_info "Docker already installed"
fi

# =============================================================================
# Step 4: Install Docker Compose if not present
# =============================================================================
if ! docker compose version &> /dev/null; then
    log_info "Installing Docker Compose plugin..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
    log_info "Docker Compose plugin installed"
else
    log_info "Docker Compose already installed"
fi

# =============================================================================
# Step 5: Create SSL directory for certificates
# =============================================================================
log_info "Creating SSL directory..."
mkdir -p /opt/edapp/nginx/ssl
log_info "SSL directory created at /opt/edapp/nginx/ssl"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "=============================================="
log_info "Infrastructure setup complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Copy your Cloudflare Origin Certificate to /opt/edapp/nginx/ssl/"
echo "   - cert.pem (certificate)"
echo "   - key.pem (private key)"
echo ""
echo "2. Copy your application files to /opt/edapp/"
echo ""
echo "3. Run deployment: cd /opt/edapp && ./deploy_gcp.sh"
echo ""
echo "GCP Firewall Rules (must be set via gcloud or Console):"
echo "  - Tag: edapp-web -> allow tcp:80,443 from 0.0.0.0/0"
echo "  - Tag: edapp-ssh -> allow tcp:22 from YOUR_IP/32"
echo ""
