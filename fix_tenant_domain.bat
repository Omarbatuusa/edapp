@echo off
echo Fixing Tenant Domain (Again)...
echo Password: Janat@2000
ssh root@139.84.243.230 "docker exec deployment_config-postgres-1 psql -U edapp -d edapp -c \"UPDATE tenants SET domain = 'lakewood.edapp.co.za' WHERE code = 'LAKE001';\""
echo.
echo Database updated. Please refresh the browser.
pause
