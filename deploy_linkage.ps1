$ErrorActionPreference = "Stop"
$server = "root@139.84.243.230"
$remoteDir = "/opt/edapp"

Write-Host ">>> Deploying Linkage Fix..." -ForegroundColor Cyan

scp "backend/db/fix_linkage.sql" "$server`:$remoteDir/fix_linkage.sql"

$remoteCmd = "cat $remoteDir/fix_linkage.sql | docker compose -f $remoteDir/deployment_config/docker-compose.yml exec -T postgres psql -U edapp -d edapp"
ssh $server $remoteCmd

Write-Host ">>> Fix Applied!" -ForegroundColor Green
Pause
