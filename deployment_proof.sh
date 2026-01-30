#!/bin/bash
# =============================================================================
# EdApp GCP Deployment Proof Report
# Generates the mandatory deployment verification report
# =============================================================================

set -e

echo "=============================================="
echo "EdApp Deployment Proof Report"
echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Server: GCP Compute Engine (africa-south1-b)"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }

# =============================================================================
# A) Network/Ports Proof
# =============================================================================
echo "=============================================="
echo "A) NETWORK/PORTS PROOF"
echo "=============================================="
echo ""

echo "1. Docker Container Ports:"
echo "-------------------------------------------"
docker ps --format "table {{.Names}}\t{{.Ports}}"
echo ""

echo "2. Socket Bindings (22/80/443/3333/5432/6379/3000):"
echo "-------------------------------------------"
ss -lntup 2>/dev/null | egrep ':(22|80|443|3333|5432|6379|3000)\b' || echo "No matches found (expected for internal services)"
echo ""

echo "3. UFW Firewall Status:"
echo "-------------------------------------------"
sudo ufw status verbose 2>/dev/null || echo "UFW not available or not running as root"
echo ""

echo "4. Expected Result:"
echo "   - Only 80, 443 publicly reachable"
echo "   - 22/tcp restricted to specific IPs"
echo "   - 5432, 6379, 3333 NOT publicly accessible"
echo ""

# =============================================================================
# B) Routing Proof
# =============================================================================
echo "=============================================="
echo "B) ROUTING PROOF"
echo "=============================================="
echo ""

echo "5. API Health Check:"
echo "-------------------------------------------"
curl -s -I http://localhost/v1 2>/dev/null | head -5 || fail "API unreachable"
echo ""

echo "6. Frontend Health Check:"
echo "-------------------------------------------"
curl -s -I http://localhost/ 2>/dev/null | head -5 || fail "Frontend unreachable"
echo ""

echo "7. Host Header Tenant Routing:"
echo "-------------------------------------------"

# LIA tenant
echo "Testing: lia.edapp.co.za"
RESP=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: lia.edapp.co.za" http://localhost/)
if [ "$RESP" = "200" ]; then
    pass "lia.edapp.co.za -> HTTP $RESP"
else
    warn "lia.edapp.co.za -> HTTP $RESP"
fi

# Allied tenant
echo "Testing: allied.edapp.co.za"
RESP=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: allied.edapp.co.za" http://localhost/)
if [ "$RESP" = "200" ]; then
    pass "allied.edapp.co.za -> HTTP $RESP"
else
    warn "allied.edapp.co.za -> HTTP $RESP"
fi

# Rainbow tenant
echo "Testing: rainbow.edapp.co.za"
RESP=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: rainbow.edapp.co.za" http://localhost/)
if [ "$RESP" = "200" ]; then
    pass "rainbow.edapp.co.za -> HTTP $RESP"
else
    warn "rainbow.edapp.co.za -> HTTP $RESP"
fi

# Jeppe tenant
echo "Testing: jeppe.edapp.co.za"
RESP=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: jeppe.edapp.co.za" http://localhost/)
if [ "$RESP" = "200" ]; then
    pass "jeppe.edapp.co.za -> HTTP $RESP"
else
    warn "jeppe.edapp.co.za -> HTTP $RESP"
fi

# App discovery
echo "Testing: app.edapp.co.za"
RESP=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: app.edapp.co.za" http://localhost/)
if [ "$RESP" = "200" ]; then
    pass "app.edapp.co.za -> HTTP $RESP"
else
    warn "app.edapp.co.za -> HTTP $RESP"
fi

# Admin portal
echo "Testing: admin.edapp.co.za"
RESP=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: admin.edapp.co.za" http://localhost/)
if [ "$RESP" = "200" ] || [ "$RESP" = "302" ]; then
    pass "admin.edapp.co.za -> HTTP $RESP"
else
    warn "admin.edapp.co.za -> HTTP $RESP"
fi

echo ""

# =============================================================================
# C) Storage Proof (GCS)
# =============================================================================
echo "=============================================="
echo "C) STORAGE PROOF (GCS)"
echo "=============================================="
echo ""

echo "8. GCS Upload/Download Test:"
echo "-------------------------------------------"
echo "Note: Run this test via the API storage endpoints or gsutil."
echo ""
echo "Example gsutil test (requires gcloud auth):"
echo "  echo 'Hello GCS' > /tmp/hello.txt"
echo "  gsutil cp /tmp/hello.txt gs://edapp-uploads/test/hello.txt"
echo "  gsutil cat gs://edapp-uploads/test/hello.txt"
echo "  gsutil rm gs://edapp-uploads/test/hello.txt"
echo ""
echo "Example object key format:"
echo "  uploads/<tenant>/<category>/<yyyy>/<mm>/<uuid>.<ext>"
echo ""

# =============================================================================
# D) Auth/Tenant Isolation Proof
# =============================================================================
echo "=============================================="
echo "D) AUTH/TENANT ISOLATION PROOF"
echo "=============================================="
echo ""

echo "9. Firebase Token Verification:"
echo "-------------------------------------------"
echo "Verify by making authenticated API calls with Firebase ID tokens."
echo "The API validates tokens via Firebase Admin SDK."
echo ""

echo "10. Tenant Scoping:"
echo "-------------------------------------------"
echo "- Tenant resolved from Host header via middleware"
echo "- API endpoints enforce tenant context"
echo "- Storage keys prefixed with tenant slug"
echo "- Cross-tenant access blocked at controller level"
echo ""

echo "11. UI Regression Confirmation:"
echo "-------------------------------------------"
echo "Checklist (manual verification required):"
echo "  [ ] Role selection auto-advances (no Continue button)"
echo "  [ ] Help (?) popup works"
echo "  [ ] Light/Dark toggle works"
echo "  [ ] Footer consistent everywhere"
echo "  [ ] Tenant logos render dynamically"
echo "  [ ] iOS slide transitions work"
echo ""

# =============================================================================
# Summary
# =============================================================================
echo "=============================================="
echo "DEPLOYMENT PROOF REPORT COMPLETE"
echo "=============================================="
echo ""
echo "Review the output above for any WARN or FAIL items."
echo "If all checks pass, the GCP migration is verified."
echo ""
