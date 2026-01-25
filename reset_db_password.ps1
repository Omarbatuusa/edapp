# Check for Administrator privileges
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Requesting Administrator privileges..." -ForegroundColor Yellow
    Start-Process powershell.exe -ArgumentList ("-NoProfile -ExecutionPolicy Bypass -File `"$((Get-Location).Path)\reset_db_password.ps1`"") -Verb RunAs
    Exit
}

$pgPath = "C:\Program Files\PostgreSQL\16\data"
$hbaFile = "$pgPath\pg_hba.conf"
$backupFile = "$pgPath\pg_hba.conf.bak"
$serviceName = "postgresql-x64-16"
$newPassword = "Janat@2000"

Write-Host "=== PostgreSQL Password Reset Tool ===" -ForegroundColor Cyan
Write-Host "Target: $hbaFile"

# 1. Backup Config
if (-not (Test-Path $backupFile)) {
    Copy-Item $hbaFile $backupFile
    Write-Host "Backup created at $backupFile" -ForegroundColor Green
}

# 2. Modify Config to TRUST (Allow connection without password)
$content = Get-Content $hbaFile
$newContent = $content -replace "(host\s+all\s+all\s+127\.0\.0\.1/32\s+)(scram-sha-256|md5)", '$1trust'
$newContent = $newContent -replace "(host\s+all\s+all\s+::1/128\s+)(scram-sha-256|md5)", '$1trust'
$newContent | Set-Content $hbaFile

# 3. Restart Service
Write-Host "Restarting Service to apply 'trust' setting..." -ForegroundColor Yellow
Restart-Service -Name $serviceName -Force
Start-Sleep -Seconds 5

# 4. Reset Password
Write-Host "Resetting password for 'postgres' and 'edapp'..." -ForegroundColor Cyan
$env:PGPASSWORD = "" # Clear env var to ensure we use trust
try {
    # Reset postgres superuser
    & "psql" -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD '$newPassword';"
    Write-Host "Password for 'postgres' reset to '$newPassword'" -ForegroundColor Green

    # Create/Reset edapp user
    & "psql" -U postgres -d postgres -c "CREATE USER edapp WITH PASSWORD '$newPassword';" 2>$null
    & "psql" -U postgres -d postgres -c "ALTER USER edapp WITH PASSWORD '$newPassword';"
    & "psql" -U postgres -d postgres -c "ALTER USER edapp CREATEDB;"
    Write-Host "Password for 'edapp' reset to '$newPassword'" -ForegroundColor Green
} catch {
    Write-Host "Error executing SQL commands." -ForegroundColor Red
}

# 5. Restore Config (Security Best Practice)
Write-Host "Restoring original security configuration..." -ForegroundColor Yellow
Copy-Item $backupFile $hbaFile -Force
Restart-Service -Name $serviceName -Force

Write-Host "`nDONE! You can now log in with password: $newPassword" -ForegroundColor Green
Read-Host "Press Enter to exit"
