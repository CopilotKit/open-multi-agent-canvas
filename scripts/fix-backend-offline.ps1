# Script to fix backend issues in offline mode

# Display header
Write-Host "KB-multi-agent Backend Fix (Offline Mode)" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Kill any existing processes
Write-Host "Killing any existing processes..." -ForegroundColor Yellow
Get-Process -Name "python*" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $_ | Stop-Process -Force
        Write-Host "Killed process $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Green
    } catch {
        Write-Host "Failed to kill process $($_.ProcessName) (PID: $($_.Id)): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Navigate to the agent directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$baseDir = Split-Path -Parent $scriptDir
$agentDir = Join-Path $baseDir "agent"

Write-Host "Navigating to agent directory: $agentDir" -ForegroundColor Yellow
Push-Location $agentDir

# Check if the .env file exists
$envFile = Join-Path $agentDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env file from example.env..." -ForegroundColor Yellow
    $exampleEnvFile = Join-Path $agentDir "example.env"
    if (Test-Path $exampleEnvFile) {
        Copy-Item $exampleEnvFile $envFile
        Write-Host "Created .env file from example.env" -ForegroundColor Green
    } else {
        Write-Host "example.env file not found, creating minimal .env file..." -ForegroundColor Yellow
        @"
# Framework Configuration
# Options: langgraph, openai_agents, hybrid
FRAMEWORK=langgraph
DEFAULT_MODEL=gpt-4o

# Backend Integration Configuration
MEMORY_BACKEND=memorysaver
LLM_BACKEND=litellm
A2A_BACKEND=inmemory
KNOWLEDGE_BACKEND=graphiti

# Database Configuration
DATABASE_BACKEND=memory
"@ | Set-Content $envFile
        Write-Host "Created minimal .env file" -ForegroundColor Green
    }
}

# Try to install dependencies using the existing lockfile
Write-Host "Installing dependencies using existing lockfile..." -ForegroundColor Yellow
Invoke-Expression "poetry install --no-interaction"

# Check if installation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    
    # Try to start the backend with the health server
    Write-Host "Starting the backend with the health server..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k poetry run python -m mcp_agent.health_server" -WindowStyle Normal
    
    Write-Host "Backend health server should be starting in a new window." -ForegroundColor Green
    Write-Host "Please check the new window for any error messages." -ForegroundColor Yellow
} else {
    Write-Host "Failed to install dependencies." -ForegroundColor Red
    Write-Host "Trying to start the health server directly..." -ForegroundColor Yellow
    
    # Try to start the health server directly
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k poetry run python -m mcp_agent.health_server" -WindowStyle Normal
}

# Return to the original directory
Pop-Location

Write-Host ""
Write-Host "Backend fix (offline mode) complete." -ForegroundColor Green
Write-Host "If the backend still doesn't start, try the following:" -ForegroundColor Yellow
Write-Host "1. Run 'poetry run python -m mcp_agent.health_server' in the agent directory" -ForegroundColor Yellow
Write-Host "2. Check if the health server is responding at http://localhost:8124/health" -ForegroundColor Yellow
Write-Host "3. Start the frontend with './start-app.ps1 -Action start -Component frontend -Force'" -ForegroundColor Yellow
Write-Host ""
