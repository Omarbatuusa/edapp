@echo off
echo ==========================================
echo      EDAPP ONE-CLICK DEPLOYER
echo ==========================================

:: 1. Move to project folder
cd /d "c:\EdApp Final"

:: 2. Package Code
echo [1/3] Packaging Code...
tar --exclude="node_modules" --exclude="dist" --exclude=".git" -czf bundle.tar.gz backend web deployment_config

:: 3. Upload Bundle & Script
echo [2/3] Uploading Bundle and Script...
scp bundle.tar.gz deploy_remote.sh root@139.84.243.230:/opt/edapp/

:: 4. Remote Commands (Execute Script)
echo [3/3] Executing Remote Deployment Script...
echo (You may need to enter your Vultr password)
ssh root@139.84.243.230 "chmod +x /opt/edapp/deploy_remote.sh; /opt/edapp/deploy_remote.sh"

echo ==========================================
echo      DONE! App should be live.
echo ==========================================
pause
