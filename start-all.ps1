# PowerShell script for starting Multi-Agent Canvas with integration verification
# This script starts both the frontend and backend and verifies they're correctly integrated

# Function to display colored text
function Write-ColorOutput {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Text,

        [Parameter(Mandatory=$true)]
        [string]$Color
    )

    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Text
    $host.UI.RawUI.ForegroundColor = $originalColor
}

# Function to check if a command exists
function Test-CommandExists {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Command
    )

    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

# Function to check if a URL is accessible
function Test-UrlAccessible {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Url,

        [int]$TimeoutSeconds = 5
    )

    try {
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Timeout = $TimeoutSeconds * 1000
        $response = $request.GetResponse()
        $response.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Set script directory as base path
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Display header
Write-ColorOutput "Multi-Agent Canvas Startup" "Green"
Write-ColorOutput "===========================" "Green"
Write-Output ""

# Check prerequisites
$prerequisites = $true

# Check if Poetry is installed
if (-not (Test-CommandExists "poetry")) {
    Write-ColorOutput "Error: Poetry is not installed or not in PATH" "Red"
    Write-Output "Please install Poetry from https://python-poetry.org/docs/#installation"
    $prerequisites = $false
}

# Check if PNPM is installed
if (-not (Test-CommandExists "pnpm")) {
    Write-ColorOutput "Error: PNPM is not installed or not in PATH" "Red"
    Write-Output "Please install PNPM from https://pnpm.io/installation"
    $prerequisites = $false
}

# Exit if prerequisites are not met
if (-not $prerequisites) {
    Write-ColorOutput "Please install the required tools and try again." "Red"
    Read-Host "Press Enter to exit"
    exit 1
}

# Start backend (agent)
Write-ColorOutput "Starting backend (MCP Agent)..." "Yellow"
$backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $scriptDir\agent && echo Installing dependencies... && poetry install && echo. && echo Starting custom server with health endpoint... && (poetry run custom-server || (echo Failed to start custom server, trying standard server... && poetry run demo))" -PassThru -WindowStyle Normal

# Wait a moment to let the server start initializing
Start-Sleep -Seconds 2

# Wait for backend to start
Write-Output "Waiting for backend to initialize..."
$backendHealthUrl = "http://localhost:8124/health"
$backendReady = $false
$attempts = 0
$maxAttempts = 30

while (-not $backendReady -and $attempts -lt $maxAttempts) {
    $attempts++
    Write-Progress -Activity "Waiting for backend" -Status "Attempt $attempts of $maxAttempts" -PercentComplete (($attempts / $maxAttempts) * 100)

    if (Test-UrlAccessible -Url $backendHealthUrl) {
        $backendReady = $true
    }
    else {
        Start-Sleep -Seconds 2
    }
}

Write-Progress -Activity "Waiting for backend" -Completed

if ($backendReady) {
    Write-ColorOutput "Backend is running and health endpoint is accessible!" "Green"
}
else {
    Write-ColorOutput "Warning: Backend health endpoint is not responding after $($maxAttempts * 2) seconds." "Yellow"
    Write-ColorOutput "The backend might still be starting up. Check the backend window for details." "Yellow"
}

# Start frontend
Write-ColorOutput "Starting frontend (Next.js)..." "Yellow"
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $scriptDir\frontend && echo Installing dependencies... && pnpm install && echo. && echo Starting Next.js development server... && pnpm run dev" -PassThru -WindowStyle Normal

# Wait for frontend to start
Write-Output "Waiting for frontend to initialize..."
$frontendUrl = "http://localhost:3000"
$frontendReady = $false
$attempts = 0
$maxAttempts = 30

while (-not $frontendReady -and $attempts -lt $maxAttempts) {
    $attempts++
    Write-Progress -Activity "Waiting for frontend" -Status "Attempt $attempts of $maxAttempts" -PercentComplete (($attempts / $maxAttempts) * 100)

    if (Test-UrlAccessible -Url $frontendUrl) {
        $frontendReady = $true
    }
    else {
        Start-Sleep -Seconds 2
    }
}

Write-Progress -Activity "Waiting for frontend" -Completed

if ($frontendReady) {
    Write-ColorOutput "Frontend is running and accessible!" "Green"
}
else {
    Write-ColorOutput "Warning: Frontend is not responding after $($maxAttempts * 2) seconds." "Yellow"
    Write-ColorOutput "The frontend might still be starting up. Check the frontend window for details." "Yellow"
}

# Verify integration
if ($backendReady -and $frontendReady) {
    Write-ColorOutput "Verifying frontend and backend integration..." "Yellow"

    # Check if frontend .env has the backend URL
    $envPath = "$scriptDir\frontend\.env"
    $envContent = Get-Content -Path $envPath -ErrorAction SilentlyContinue

    if ($envContent -match "NEXT_PUBLIC_BACKEND_URL=http://localhost:8123") {
        Write-ColorOutput "Frontend is correctly configured to connect to the backend!" "Green"
    }
    else {
        Write-ColorOutput "Warning: Frontend .env file might not be properly configured." "Yellow"
        Write-ColorOutput "Please ensure NEXT_PUBLIC_BACKEND_URL=http://localhost:8123 is in the frontend/.env file." "Yellow"
    }
}

# Display information about the running services
Write-Output ""
Write-ColorOutput "Multi-Agent Canvas is running!" "Green"
Write-Output ""
Write-ColorOutput "Backend API: http://localhost:8124" "Cyan"
Write-ColorOutput "Backend Health: http://localhost:8124/health" "Cyan"
Write-ColorOutput "Frontend: http://localhost:3000" "Cyan"
Write-Output ""
Write-ColorOutput "Note: It may take a few moments for both services to fully initialize." "Yellow"
Write-ColorOutput "Check the opened terminal windows for detailed progress." "Yellow"
Write-Output ""

# Keep the script running to maintain the processes
Write-Output "Press Ctrl+C to stop the script. This will NOT stop the services."
Write-Output "To stop the services, close the terminal windows."

try {
    while ($true) {
        Start-Sleep -Seconds 10

        # Check if processes are still running
        if ($backendProcess.HasExited) {
            Write-ColorOutput "Warning: Backend process has exited." "Red"
        }

        if ($frontendProcess.HasExited) {
            Write-ColorOutput "Warning: Frontend process has exited." "Red"
        }
    }
}
catch {
    Write-Output ""
    Write-ColorOutput "Script interrupted. The services will continue running in their windows." "Yellow"
}
