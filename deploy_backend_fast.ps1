$ErrorActionPreference = "Stop"

Write-Host ">>> Starting Fast BACKEND Deploy..."

# 1. Zip the backend folder (EXCLUDING node_modules and .env)
Write-Host "1. Zipping backend folder (Skipping node_modules)..."
if (Test-Path "backend_deploy.zip") { Remove-Item "backend_deploy.zip" }
Get-ChildItem -Path "backend" -Exclude "node_modules", ".env" | Compress-Archive -DestinationPath "backend_deploy.zip" -CompressionLevel Fastest

# 2. Upload to Server
Write-Host "2. Uploading to Vultr..."
scp backend_deploy.zip root@139.84.243.230:/opt/edapp/backend_deploy.zip

# 3. Remote Rebuild
# Unzip to temp, copy over backend, rebuild API
$remoteCmd = "cd /opt/edapp && echo '>>> Unzipping Backend...' && rm -rf backend_temp && mkdir backend_temp && unzip -q -o backend_deploy.zip -d backend_temp && cp -r backend_temp/* backend/ && rm -rf backend_temp && rm backend_deploy.zip && echo '>>> Rebuilding API...' && cd deployment_config && docker compose build api && docker compose up -d --no-deps api && echo '>>> Done!'"

Write-Host "3. Triggering Remote Rebuild..."
ssh root@139.84.243.230 $remoteCmd

Write-Host ">>> Backend Deploy Complete!"
Pause
