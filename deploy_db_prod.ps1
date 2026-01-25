$ErrorActionPreference = "Stop"
$server = "root@139.84.243.230"
$remoteDir = "/opt/edapp"

Write-Host ">>> Starting Production Database Deployment..." -ForegroundColor Cyan

# 1. Zip the DB folder
Write-Host "1. Zipping 'backend/db' folder..."
if (Test-Path "db_deploy.zip") { Remove-Item "db_deploy.zip" }
Get-ChildItem -Path "backend/db" | Compress-Archive -DestinationPath "db_deploy.zip" -CompressionLevel Fastest

# 2. Upload to Server
Write-Host "2. Uploading to Vultr ($server)..."
scp db_deploy.zip "$server`:$remoteDir/db_deploy.zip"

# 3. Remote Execution
Write-Host "3. Executing Remote Migrations (Schema + Seeds)..."

# Construct the remote command
# We use 'docker compose exec -T' (Target container: 'postgres', User: 'edapp', DB: 'edapp')
# We pipe the file content into psql.
$cmdList = @(
    "cd $remoteDir",
    "rm -rf db_temp",
    "unzip -q -o db_deploy.zip -d db_temp",
    "echo '>>> Applying Schema Updates...'",
    "cat db_temp/schema_academic.sql | docker compose exec -T postgres psql -U edapp -d edapp",
    "cat db_temp/schema_assignments.sql | docker compose exec -T postgres psql -U edapp -d edapp",
    "cat db_temp/schema_attendance.sql | docker compose exec -T postgres psql -U edapp -d edapp",
    "echo '>>> Seeding Tenants...'",
    "cat db_temp/seed_tenants.sql | docker compose exec -T postgres psql -U edapp -d edapp",
    "echo '>>> Seeding Integration Data (Class 11A)...'",
    "cat db_temp/seed_integration.sql | docker compose exec -T postgres psql -U edapp -d edapp",
    "rm -rf db_temp",
    "rm db_deploy.zip",
    "echo '>>> Database Deployment Complete!'"
)

# Join commands with ' && ' for sequential execution
$remoteCmd = $cmdList -join " && "

# Execute via SSH
ssh $server $remoteCmd

Write-Host ">>> Done!" -ForegroundColor Green
Pause
