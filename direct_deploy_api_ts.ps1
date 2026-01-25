$ErrorActionPreference = "Stop"
$server = "root@139.84.243.230"
$remotePath = "/opt/edapp/web/src/services/api.ts"
$localPath = "web\src\services\api.ts"

Write-Host ">>> Directly Uploading api.ts..." -ForegroundColor Cyan

# Upload Single File
scp $localPath "$server`:$remotePath"

Write-Host ">>> Rebuilding Web Container..." -ForegroundColor Cyan
$remoteCmd = "cd /opt/edapp/deployment_config && " +
"docker compose build --no-cache web && " +
"docker compose up -d --force-recreate --no-deps web && " +
"echo '>>> Web Rebuild Complete'"

ssh $server $remoteCmd

Write-Host ">>> Done!" -ForegroundColor Green
Pause
