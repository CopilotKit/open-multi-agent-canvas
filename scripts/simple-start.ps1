# PowerShell script to start the application in minimal mode
# This script focuses on just getting the backend and frontend running

# Display header
Write-Host "KB-multi-agent Simple Starter" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host ""

# Get base directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$baseDir = Split-Path -Parent $scriptDir
$agentDir = Join-Path $baseDir "agent"
$frontendDir = Join-Path $baseDir "frontend"

Write-Host "Base directory: $baseDir" -ForegroundColor Cyan
Write-Host "Agent directory: $agentDir" -ForegroundColor Cyan
Write-Host "Frontend directory: $frontendDir" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start the backend health server
Write-Host "Step 1: Starting the backend health server..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

# Navigate to the agent directory
Push-Location $agentDir

# Start the health server
Write-Host "Starting the backend health server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k poetry run python -m mcp_agent.health_server" -WindowStyle Normal

# Return to the original directory
Pop-Location

# Step 2: Start the frontend
Write-Host ""
Write-Host "Step 2: Starting the frontend..." -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

# Navigate to the frontend directory
Push-Location $frontendDir

# Start the frontend
Write-Host "Starting the frontend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k pnpm run dev" -WindowStyle Normal

# Return to the original directory
Pop-Location

# Final summary
Write-Host ""
Write-Host "Startup Complete!" -ForegroundColor Green
Write-Host "================" -ForegroundColor Green
Write-Host "The application should now be running in minimal mode." -ForegroundColor Cyan
Write-Host "Backend URL: http://localhost:8124" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:3000 or http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Note: The backend is running in fallback mode with limited functionality." -ForegroundColor Yellow
Write-Host "This is sufficient for basic usage but some advanced features may not be available." -ForegroundColor Yellow
Write-Host ""
