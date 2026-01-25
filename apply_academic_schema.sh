#!/bin/bash
set -e

echo ">>> Copying SQL files to container..."
docker cp /opt/edapp/backend/db/schema_academic.sql edapp-postgres-1:/tmp/schema_academic.sql
docker cp /opt/edapp/backend/db/schema_assignments.sql edapp-postgres-1:/tmp/schema_assignments.sql
docker cp /opt/edapp/backend/db/schema_attendance.sql edapp-postgres-1:/tmp/schema_attendance.sql
docker cp /opt/edapp/backend/db/seed_academic_demo.sql edapp-postgres-1:/tmp/seed_academic_demo.sql

echo ">>> Applying Academic Schema..."
docker exec -e PGPASSWORD=password123 edapp-postgres-1 psql -U edapp -d edapp -f /tmp/schema_academic.sql

echo ">>> Applying Assignments Schema..."
docker exec -e PGPASSWORD=password123 edapp-postgres-1 psql -U edapp -d edapp -f /tmp/schema_assignments.sql

echo ">>> Applying Attendance Schema..."
docker exec -e PGPASSWORD=password123 edapp-postgres-1 psql -U edapp -d edapp -f /tmp/schema_attendance.sql

echo ">>> Seeding Academic Demo Data..."
docker exec -e PGPASSWORD=password123 edapp-postgres-1 psql -U edapp -d edapp -f /tmp/seed_academic_demo.sql

echo ">>> Done!"
