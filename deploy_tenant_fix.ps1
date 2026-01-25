$ErrorActionPreference = "Stop"
$server = "root@139.84.243.230"
$remoteDir = "/opt/edapp"

Write-Host ">>> Deploying Tenant Domain Fix..." -ForegroundColor Cyan

# Upload SQL
scp backend\curl_user.sh "$server`:/opt/edapp/backend/"
$remoteCmd = "echo '--- NGINX LOGS ---' && docker compose -f /opt/edapp/deployment_config/docker-compose.yml logs --tail=50 nginx && echo '--- API LOGS ---' && docker compose -f /opt/edapp/deployment_config/docker-compose.yml logs --tail=50 api && echo '--- ENV CHECK ---' && docker compose -f /opt/edapp/deployment_config/docker-compose.yml exec -T api env | grep -E 'R2|AWS|S3|SSL|KEY'"
