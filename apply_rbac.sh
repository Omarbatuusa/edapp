#!/bin/bash
set -e

echo ">>> Copying SQL files to container..."
docker cp /tmp/schema_rbac.sql edapp-postgres-1:/tmp/s.sql
docker cp /tmp/seed_rbac_caps.sql edapp-postgres-1:/tmp/sc.sql
docker cp /tmp/seed_assignments.sql edapp-postgres-1:/tmp/sa.sql

echo ">>> Applying Schema..."
docker exec -e PGPASSWORD=password123 edapp-postgres-1 psql -U edapp -d edapp -f /tmp/s.sql

echo ">>> Applying Capabilities..."
docker exec -e PGPASSWORD=password123 edapp-postgres-1 psql -U edapp -d edapp -f /tmp/sc.sql

echo ">>> Applying Assignments..."
docker exec -e PGPASSWORD=password123 edapp-postgres-1 psql -U edapp -d edapp -f /tmp/sa.sql

echo ">>> Verifying..."
docker exec -e PGPASSWORD=password123 edapp-postgres-1 psql -U edapp -d edapp -c "SELECT count(*) FROM user_role_assignments;"
echo ">>> Done!"
