$ErrorActionPreference = "Stop"
$server = "root@139.84.243.230"
$remoteDir = "/opt/edapp"

Write-Host ">>> Deploying Password Fix..." -ForegroundColor Cyan

scp "backend/db/fix_prod_password.sql" "$server`:$remoteDir/fix_prod_password.sql"

$remoteCmd = "cat $remoteDir/fix_prod_password.sql | docker compose -f $remoteDir/deployment_config/docker-compose.yml exec -T postgres psql -U edapp -d edapp"
ssh $server $remoteCmd

Write-Host ">>> Fix Applied!" -ForegroundColor Green
Pause
