# deploy_reset.ps1 - Clean Production Deployment
$server = "root@139.84.243.230"
$localDir = "c:\EdApp Final"
$remoteDir = "/opt/edapp"

Write-Host ">>> STARTING PRODUCTION RESET..." -ForegroundColor Red

# 1. Upload Configuration & Code
Write-Host ">>> Uploading Configuration..." -ForegroundColor Cyan
scp "$localDir\deployment_config\.env" "$server`:$remoteDir/deployment_config/"
scp "$localDir\deployment_config\nginx\certs\origin.pem" "$server`:$remoteDir/deployment_config/nginx/certs/"
scp "$localDir\deployment_config\nginx\certs\origin.key" "$server`:$remoteDir/deployment_config/nginx/certs/"

Write-Host ">>> Uploading Backend Code..." -ForegroundColor Cyan
scp -r "$localDir\backend\src" "$server`:$remoteDir/backend/"
scp "$localDir\backend\package.json" "$server`:$remoteDir/backend/"
scp "$localDir\backend\db\init_db_prod.sql" "$server`:$remoteDir/backend/db/"

scp "$localDir\backend\db\seed_production_real.sql" "$server`:$remoteDir/backend/db/"
$remoteCmd = "cat $remoteDir/backend/db/seed_production_real.sql | docker compose -f /opt/edapp/deployment_config/docker-compose.yml exec -T postgres psql -U edapp -d edapp"
ssh $server $remoteCmd

Write-Host ">>> Production Reset Complete." -ForegroundColor Green
