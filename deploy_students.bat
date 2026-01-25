@echo off
echo ==========================================
echo  Deploying Database Updates (Phase 7)
echo ==========================================
echo.
echo 1/3 Uploading SQL files to server...
scp "backend/db/migrations/02_add_profile_fields.sql" root@139.84.243.230:/root/migration.sql
scp "backend/db/seed_students.sql" root@139.84.243.230:/root/seed.sql
echo.

echo 2/3 Running Migration (Adding columns)...
ssh root@139.84.243.230 "cat /root/migration.sql | docker exec -i deployment_config-postgres-1 psql -U edapp -d edapp"
echo.

echo 3/3 Seeding Students (Zola ^& Lefu)...
ssh root@139.84.243.230 "cat /root/seed.sql | docker exec -i deployment_config-postgres-1 psql -U edapp -d edapp"
echo.

echo Cleaning up...
ssh root@139.84.243.230 "rm /root/migration.sql /root/seed.sql"
echo.
echo Done! Student accounts created.
pause
