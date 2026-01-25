$ErrorActionPreference = "Stop"
$server = "root@139.84.243.230"
$remoteDir = "/opt/edapp/deployment_config"

Write-Host ">>> Forcing Remote Rebuild (No Cache)..." -ForegroundColor Cyan

$remoteCmd = "cd $remoteDir && " +
"docker compose build --no-cache api && " +
"docker compose up -d --force-recreate --no-deps api && " +
"echo '>>> Rebuild Complete'"

ssh $server $remoteCmd

Write-Host ">>> Done!" -ForegroundColor Green
Pause
