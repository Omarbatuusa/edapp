@echo off
echo Force Updating User Passwords and Tenant Links (Direct SQL)...
echo Password: Janat@2000

ssh root@139.84.243.230 "docker exec deployment_config-postgres-1 psql -U edapp -d edapp -c \"UPDATE profiles SET tenant_id = (SELECT id FROM tenants WHERE code = 'LAKE001'), password_hash = '\$2y\$10\$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa' WHERE email IN ('admin@lakewood.edu', 'zola@lakewood.edu', 'lefu@lakewood.edu');\""

echo.
echo Database Updated.
echo Please try logging in as:
echo admin@lakewood.edu / password123
echo zola@lakewood.edu / password123
pause
