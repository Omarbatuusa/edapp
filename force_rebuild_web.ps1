$ErrorActionPreference = "Stop"
$server = "root@139.84.243.230"
$remoteDir = "/opt/edapp/deployment_config"

Write-Host ">>> Forcing WEB Rebuild (No Cache)..." -ForegroundColor Cyan

$remoteCmd = "cd $remoteDir && " +
"docker compose build --no-cache web && " +
"docker compose up -d --force-recreate --no-deps web && " +
"echo '>>> Web Rebuild Complete'"

ssh $server $remoteCmd

Write-Host ">>> Done!" -ForegroundColor Green
Pause
