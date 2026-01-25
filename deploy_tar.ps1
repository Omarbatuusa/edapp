$ErrorActionPreference = "Stop"

Write-Host ">>> Creating Tar Bundle (backend, web, deployment_config)..."
if (Test-Path "bundle.tar.gz") { Remove-Item "bundle.tar.gz" }

# Using tar to create a gzip archive, excluding node_modules and hidden git files
tar --exclude "node_modules" --exclude ".git" --exclude ".env" -czf bundle.tar.gz backend web deployment_config

if (-not (Test-Path "bundle.tar.gz")) {
    Write-Error "Failed to create bundle.tar.gz"
}

Write-Host ">>> Uploading Bundle to Vultr..."
scp bundle.tar.gz root@139.84.243.230:/opt/edapp/bundle.tar.gz

Write-Host ">>> Triggering Remote Deployment Script..."
# We assume deploy_remote.sh exists on server. If not, we might need to upload it too.
# But previous steps showed it exists.
ssh root@139.84.243.230 "chmod +x /opt/edapp/deploy_remote.sh && /opt/edapp/deploy_remote.sh"

Write-Host ">>> Deployment Triggered!"
Pause
