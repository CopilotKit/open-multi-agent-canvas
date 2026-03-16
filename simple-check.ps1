# Simple health check script
Write-Host "Checking backend health..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:8123/health" -UseBasicParsing -ErrorAction Stop
    Write-Host "Backend health endpoint is accessible: $($backendHealth.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Backend health endpoint is not accessible: $_" -ForegroundColor Red
}

Write-Host "Checking frontend..." -ForegroundColor Yellow
try {
    # Try port 3001 first (in case port 3000 is in use)
    try {
        $frontend = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -ErrorAction Stop
        Write-Host "Frontend is accessible on port 3001: $($frontend.StatusCode)" -ForegroundColor Green
    } catch {
        # Fall back to port 3000
        $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
        Write-Host "Frontend is accessible on port 3000: $($frontend.StatusCode)" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend is not accessible on either port 3000 or 3001: $_" -ForegroundColor Red
}

Write-Host "Checking .env file..." -ForegroundColor Yellow
$envPath = "frontend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content -Path $envPath -ErrorAction SilentlyContinue
    if ($envContent -match "NEXT_PUBLIC_BACKEND_URL=http://localhost:8123") {
        Write-Host "Frontend is correctly configured to connect to the backend" -ForegroundColor Green
    } else {
        Write-Host "Frontend .env file does not contain the correct backend URL" -ForegroundColor Red
    }
} else {
    Write-Host "Frontend .env file not found" -ForegroundColor Red
}

Write-Host "Press Enter to exit..."
Read-Host
