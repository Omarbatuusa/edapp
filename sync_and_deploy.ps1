# sync_and_deploy.ps1
$ServerIP = "139.84.243.230"
$RemotePath = "/opt/edapp"

Write-Host "[1/3] Packaging code..."
tar --exclude="node_modules" --exclude="dist" --exclude=".git" --exclude=".next" -czf bundle.tar.gz apps nginx deployment_config docker-compose.yml .env.production firebase-service-account.json 2>&1 | Out-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Tar packaging failed with code $LASTEXITCODE"
    exit 1
}

Write-Host "[2/3] Uploading bundle to Vultr ($ServerIP)..."
# Check if bundle exists
if (!(Test-Path bundle.tar.gz)) {
    Write-Host "ERROR: bundle.tar.gz not found!"
    exit 1
}

# Use explicit path to scp if needed, but assuming it's in PATH
Write-Host "Running SCP..."
scp -o StrictHostKeyChecking=no bundle.tar.gz root@${ServerIP}:${RemotePath}/ 2>&1 | Out-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SCP failed with code $LASTEXITCODE"
    exit 1
}

Write-Host "[3/3] Extracting and restarting containers..."
$RemoteCmd = "cd ${RemotePath}; tar -xzf bundle.tar.gz; rm bundle.tar.gz; docker compose down; docker compose up -d --build"
Write-Host "Running SSH..."
ssh -o StrictHostKeyChecking=no root@${ServerIP} $RemoteCmd 2>&1 | Out-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SSH remote command failed with code $LASTEXITCODE"
    exit 1
}

Write-Host "Deployment Complete! The remote server is running your latest code."
