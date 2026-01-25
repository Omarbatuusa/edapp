@echo off
echo Fixing User Passwords and Tenant Links...
echo Password: Janat@2000
scp backend/db/force_fix_users.sql root@139.84.243.230:/tmp/force_fix_users.sql
ssh root@139.84.243.230 "docker exec deployment_config-postgres-1 psql -U edapp -d edapp -f /tmp/force_fix_users.sql"
echo.
echo Done. Try logging in with 'password123'.
pause
