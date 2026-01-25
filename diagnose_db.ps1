Write-Host "=== PostgreSQL Service Diagnostic ===" -ForegroundColor Cyan

# 1. Check Windows Services
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Found Service: $($service.Name) ($($service.Status))" -ForegroundColor Green
} else {
    Write-Host "No Windows Service found starting with 'postgresql'" -ForegroundColor Red
    Write-Host "Checking for any SQL service..."
    Get-Service -Name "*sql*" | Format-Table Name, Status
}

# 2. Check Port 5432
Write-Host "`n=== Checking Port 5432 ===" -ForegroundColor Cyan
$port = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "Port 5432 is LISTENING (PID: $($port.OwningProcess))" -ForegroundColor Green
    $process = Get-Process -Id $port.OwningProcess
    Write-Host "Process Name: $($process.ProcessName)" -ForegroundColor Yellow
} else {
    Write-Host "Port 5432 is NOT listening." -ForegroundColor Red
}

# 3. Try Default Passwords
Write-Host "`n=== Testing Default Credentials ===" -ForegroundColor Cyan
$candidates = @(
    @{ User = "postgres"; Pass = "" },        # Empty
    @{ User = "postgres"; Pass = "postgres" }, # Default
    @{ User = "postgres"; Pass = "password" }, # Common
    @{ User = "admin"; Pass = "admin" }
)

foreach ($c in $candidates) {
    $p = $c.Pass
    $u = $c.User
    $display = if ($p -eq "") { "(empty)" } else { $p }
    
    Write-Host "Testing User: $u | Pass: $display" -NoNewline
    
    $env:PGPASSWORD = $p
    psql -h localhost -U $u -d postgres -c "SELECT version();" -w 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " -> SUCCESS!" -ForegroundColor Green
    } else {
        Write-Host " -> Failed" -ForegroundColor Gray
    }
}
