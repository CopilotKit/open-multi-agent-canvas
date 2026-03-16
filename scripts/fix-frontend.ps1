# PowerShell script to fix frontend chunk loading issues

Write-Host "Fixing frontend chunk loading issues..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Navigate to the frontend directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$baseDir = Split-Path -Parent $scriptDir
$frontendDir = Join-Path $baseDir "frontend"

Write-Host "Navigating to frontend directory: $frontendDir" -ForegroundColor Yellow
Push-Location $frontendDir

# Stop any running Next.js processes
Write-Host "Stopping any running Next.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "next" } | ForEach-Object {
    try {
        $_ | Stop-Process -Force
        Write-Host "Stopped process $($_.Id)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to stop process $($_.Id): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Clear Next.js cache
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Cleared .next directory" -ForegroundColor Green
}

# Clear node_modules/.cache
Write-Host "Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "Cleared node_modules/.cache directory" -ForegroundColor Green
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Build the application
Write-Host "Building the application..." -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build the application" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Start the application
Write-Host "Starting the application..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k pnpm run dev" -WindowStyle Normal

# Return to the original directory
Pop-Location

Write-Host ""
Write-Host "Frontend fix complete!" -ForegroundColor Green
Write-Host "The application should now be running without chunk loading errors." -ForegroundColor Green
Write-Host "If you still encounter issues, try the following:" -ForegroundColor Yellow
Write-Host "1. Clear your browser cache" -ForegroundColor Yellow
Write-Host "2. Try a different browser" -ForegroundColor Yellow
Write-Host "3. Check for any JavaScript errors in the browser console" -ForegroundColor Yellow
Write-Host ""
