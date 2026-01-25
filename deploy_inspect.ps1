$ErrorActionPreference = "Stop"
$server = "root@139.84.243.230"
$remoteDir = "/opt/edapp"

Write-Host ">>> Inspecting Production Data..." -ForegroundColor Cyan

scp "backend/db/inspect_user.sql" "$server`:$remoteDir/inspect_user.sql"

$remoteCmd = "cat $remoteDir/inspect_user.sql | docker compose -f $remoteDir/deployment_config/docker-compose.yml exec -T postgres psql -U edapp -d edapp"
ssh $server $remoteCmd

Pause
