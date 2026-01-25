@echo off
echo Final Fix for User Passwords (Valid Hash)...
echo Password: Janat@2000

ssh root@139.84.243.230 "docker exec deployment_config-postgres-1 psql -U edapp -d edapp -c \"UPDATE profiles SET tenant_id = (SELECT id FROM tenants WHERE code = 'LAKE001'), password_hash = '\$2a\$10\$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC' WHERE email IN ('admin@lakewood.edu', 'zola@lakewood.edu', 'lefu@lakewood.edu');\""

echo.
echo Database Updated with Valid Hash.
echo Please try logging in as:
echo admin@lakewood.edu / password123
pause
