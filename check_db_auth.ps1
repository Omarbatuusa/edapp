$password = "Janat@2000"
$users = @("postgres", "edapp", "admin", "root", "ssebu", "Administrator")

Write-Host "Checking PostgreSQL Authentication on localhost:5432..." -ForegroundColor Cyan
Write-Host "Password being tested: $password" -ForegroundColor Yellow

$env:PGPASSWORD = $password

foreach ($user in $users) {
    Write-Host "----------------------------------------"
    Write-Host "Testing user: [$user]" -NoNewline
    
    # Try connecting to 'postgres' database (usually default)
    $output = psql -h localhost -U $user -d postgres -c "SELECT current_user;" -w 2>&1 
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " -> SUCCESS!" -ForegroundColor Green
        Write-Host "You can use this username: $user" -ForegroundColor Green
    } else {
        Write-Host " -> FAILED" -ForegroundColor Red
        # Start-Sleep -Milliseconds 100
    }
}
Write-Host "----------------------------------------"
Write-Host "Make sure your PostgreSQL service is running."
