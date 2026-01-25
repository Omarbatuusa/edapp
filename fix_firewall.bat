@echo off
echo ==========================================
echo      FIXING FIREWALL (OPENING PORTS)
echo ==========================================

echo Connecting to Vultr to allow Web Traffic...
ssh root@139.84.243.230 "ufw allow 22/tcp; ufw allow 80/tcp; ufw allow 443/tcp; ufw --force enable; ufw status"

echo ==========================================
echo      Firewall Updated.
echo ==========================================
pause
