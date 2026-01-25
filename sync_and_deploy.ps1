# sync_and_deploy.ps1
$ServerIP = "139.84.243.230"
$RemotePath = "/opt/edapp"

Write-Host "📦 [1/3] Packaging code (skipping huge node_modules)..."
# Use tar to bundle, excluding heavy local folders
tar --exclude="node_modules" --exclude="dist" --exclude=".git" -czf bundle.tar.gz backend web deployment_config

Write-Host "🚀 [2/3] Uploading bundle to Vultr ($ServerIP)..."
scp bundle.tar.gz root@${ServerIP}:${RemotePath}/

Write-Host "🔄 [3/3] Extracting & restarting containers..."
# We use semicolons ';' because PowerShell hates '&&' in strings sometimes
$RemoteCmd = "cd ${RemotePath}; tar -xzf bundle.tar.gz; rm bundle.tar.gz; cd deployment_config; docker compose up -d --build"
ssh root@${ServerIP} $RemoteCmd

Write-Host "✅ Deployment Complete! The remote server is running your latest code."
