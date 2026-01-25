@echo off
echo Seeding Users with Correct Dependencies...
echo You will be asked for the server password (Janat@2000) twice.

echo 1. Copying SQL file to Host...
scp backend/db/seed_fix_full.sql root@139.84.243.230:/tmp/seed_fix_full.sql

echo 2. Executing SQL (Piping to Docker Container)...
ssh root@139.84.243.230 "cat /tmp/seed_fix_full.sql | docker exec -i deployment_config-postgres-1 psql -U edapp -d edapp"

echo.
echo Done. Verifying...
ssh root@139.84.243.230 "docker exec deployment_config-postgres-1 psql -U edapp -d edapp -c \"SELECT id, email, role, tenant_id FROM profiles;\""

pause
