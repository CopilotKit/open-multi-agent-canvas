# PowerShell script to install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan

# Change to the agent directory
Set-Location -Path "agent"

# Install Sentry SDK with FastAPI integration
Write-Host "Installing Sentry SDK..." -ForegroundColor Yellow
poetry add "sentry-sdk[fastapi]"

# We don't need to install httpx explicitly as it's already a dependency
# of copilotkit, but we need to make sure we're using a compatible version
Write-Host "Checking httpx compatibility..." -ForegroundColor Yellow
poetry show httpx

# If we need to update dependencies to resolve conflicts
Write-Host "Updating dependencies..." -ForegroundColor Yellow
poetry update

Write-Host "Backend dependencies installed!" -ForegroundColor Green

# Return to the original directory
Set-Location -Path ".."

Write-Host "Press Enter to exit..."
Read-Host
