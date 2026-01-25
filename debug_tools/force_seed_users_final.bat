@echo off
echo Force Seeding Users...
echo Password: Janat@2000

ssh root@139.84.243.230 "docker exec deployment_config-postgres-1 psql -U edapp -d edapp -c \"INSERT INTO profiles (email, first_name, last_name, role, tenant_id, password_hash) VALUES ('admin@lakewood.edu', 'Admin', 'User', 'staff', (SELECT id FROM tenants WHERE code = 'LAKE001'), '\$2a\$10\$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC');\""

echo.
echo Users seeded. Running check...
ssh root@139.84.243.230 "docker exec deployment_config-postgres-1 psql -U edapp -d edapp -c \"SELECT id, email, tenant_id FROM profiles;\""

echo.
echo Done. Try logging in now.
pause
