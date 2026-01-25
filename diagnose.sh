#!/bin/bash
echo "--- CONTAINER STATUS ---"
docker ps -a --filter name=deployment_config-api-1

echo "--- AUTH.JS CONTENT (First 15 lines) ---"
docker cp deployment_config-api-1:/app/src/routes/auth.js /tmp/auth_check.js
cat /tmp/auth_check.js | head -n 15

echo "--- RBAC.JS CONTENT (First 5 lines) ---"
docker cp deployment_config-api-1:/app/src/routes/rbac.js /tmp/rbac_check.js
cat /tmp/rbac_check.js | head -n 5

echo "--- RECENT LOGS ---"
docker logs --tail 30 deployment_config-api-1
