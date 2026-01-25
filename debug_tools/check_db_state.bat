@echo off
echo Checking Database State...
echo Password: Janat@2000

ssh root@139.84.243.230 "echo '--- TENANTS ---'; docker exec deployment_config-postgres-1 psql -U edapp -d edapp -c \"SELECT id, name, code, domain FROM tenants;\"; echo '--- PROFILES ---'; docker exec deployment_config-postgres-1 psql -U edapp -d edapp -c \"SELECT id, email, tenant_id, role FROM profiles;\";"

echo.
echo Check complete.
pause
