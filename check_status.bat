@echo off
echo ==========================================
echo      EDAPP STATUS CHECK
echo ==========================================

echo Connecting to Vultr...
echo (Enter Password if asked)

ssh root@139.84.243.230 "echo '--- CONTAINER STATUS ---'; docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'; echo ''; echo '--- API HEALTH CHECK ---'; curl -s http://localhost:3000/v1/health; echo ''; echo '--- DB CHECK ---'; docker exec deployment_config-postgres-1 psql -U edapp -d edapp -c 'SELECT count(*) FROM public.policies;'"

echo ==========================================
echo      If you see containers and 'status:ok', we are good!
echo ==========================================
pause
