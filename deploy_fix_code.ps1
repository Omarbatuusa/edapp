$ErrorActionPreference = "Stop"
$server = "root@139.84.243.230"
$remoteDir = "/opt/edapp"

Write-Host ">>> Deploying Fast Fix (Code Only)..." -ForegroundColor Cyan

# Zip web folder (skipping node_modules)
Write-Host "1. Zipping web..."
if (Test-Path "web_deploy.zip") { Remove-Item "web_deploy.zip" }
Get-ChildItem -Path "web" -Exclude "node_modules" | Compress-Archive -DestinationPath "web_deploy.zip" -CompressionLevel Fastest

# Zip backend folder (skipping node_modules)
Write-Host "2. Zipping backend..."
if (Test-Path "backend_deploy.zip") { Remove-Item "backend_deploy.zip" }
Get-ChildItem -Path "backend" -Exclude "node_modules" | Compress-Archive -DestinationPath "backend_deploy.zip" -CompressionLevel Fastest

# Upload
Write-Host "3. Uploading..."
scp web_deploy.zip "$server`:$remoteDir/web_deploy.zip"
scp backend_deploy.zip "$server`:$remoteDir/backend_deploy.zip"

# Remote Execution
$remoteCmd = "cd $remoteDir && " +
"unzip -q -o backend_deploy.zip -d backend && rm backend_deploy.zip && " +
"unzip -q -o web_deploy.zip -d web && rm web_deploy.zip && " +
"cd deployment_config && docker compose up -d --build --no-deps api backend web && " +
"echo '>>> Restarted API'"

ssh $server $remoteCmd

Write-Host ">>> Done!" -ForegroundColor Green
Pause
