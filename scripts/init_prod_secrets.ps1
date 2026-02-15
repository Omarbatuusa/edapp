# scripts/init_prod_secrets.ps1
# Usage: ./scripts/init_prod_secrets.ps1 <ServerIP>

param (
    [Parameter(Mandatory=$true)]
    [string]$ServerIP
)

$RemotePath = "/opt/edapp"
$LocalConfigPath = "CONFIG_SERVER_ENV.sh"

# 1. Check if config file exists
if (!(Test-Path $LocalConfigPath)) {
    Write-Host "ERROR: $LocalConfigPath not found in current directory!"
    exit 1
}

Write-Host " [1/2] Uploading configuration script to $ServerIP..."
# Upload
scp -o StrictHostKeyChecking=no $LocalConfigPath ${ServerIP}:${RemotePath}/CONFIG_SERVER_ENV.sh 2>&1 | Out-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SCP failed. Please ensure you have SSH access."
    exit 1
}

Write-Host " [2/2] Applying configuration on server..."
# Make executable and run
$RemoteCmd = "cd ${RemotePath}; chmod +x CONFIG_SERVER_ENV.sh; ./CONFIG_SERVER_ENV.sh"
ssh -o StrictHostKeyChecking=no ${ServerIP} $RemoteCmd 2>&1 | Out-Host

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Remote configuration failed."
    exit 1
}

Write-Host "✅ Secrets applied and services restarted!"
