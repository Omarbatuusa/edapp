$ErrorActionPreference = "Stop"

Write-Host ">>> Starting Fast Frontend Deploy (Fixed Line Endings)..."

# 1. Zip the web folder (EXCLUDING node_modules)
Write-Host "1. Zipping web folder (Skipping node_modules)..."
if (Test-Path "web_deploy.zip") { Remove-Item "web_deploy.zip" }
Get-ChildItem -Path "web" -Exclude "node_modules" | Compress-Archive -DestinationPath "web_deploy.zip" -CompressionLevel Fastest

# 2. Upload to Server
Write-Host "2. Uploading to Vultr..."
scp web_deploy.zip root@139.84.243.230:/opt/edapp/web_deploy.zip

# 3. Remote Rebuild
# We construct the command as a single line to avoid Windows CRLF (\r\n) issues causing errors in Linux/Bash
$remoteCmd = "cd /opt/edapp && echo '>>> Unzipping...' && rm -rf web_temp && mkdir web_temp && unzip -q -o web_deploy.zip -d web_temp && cp -r web_temp/* web/ && rm -rf web_temp && rm web_deploy.zip && echo '>>> Rebuilding Frontend...' && docker compose build frontend && docker compose up -d --no-deps frontend && echo '>>> Done!'"

Write-Host "3. Triggering Remote Rebuild..."
ssh root@139.84.243.230 $remoteCmd

Write-Host ">>> Deploy Complete!"
Pause
