# PowerShell script to diagnose and fix common issues with the KB-multi-agent backend
# This script checks for common issues and provides solutions

# Import the utility module
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$utilsPath = Join-Path $scriptDir "KBUtils.psm1"

if (-not (Test-Path $utilsPath)) {
    Write-Error "Utility module not found at $utilsPath"
    exit 1
}

Import-Module $utilsPath -Force

# Set script directory as base path
$baseDir = Get-BaseDirectory

# Display header
Write-ColorOutput "KB-multi-agent Backend Diagnostics" "Green"
Write-ColorOutput "=================================" "Green"
Write-Output ""

# Check if backend is running
Write-ColorOutput "Checking if backend is running..." "Yellow"
$backendRunning = Test-BackendStatus -Detailed

if ($backendRunning) {
    Write-ColorOutput "Backend is running correctly!" "Green"
    Write-Output ""
    Write-ColorOutput "No further action needed." "Green"
    exit 0
}

# Backend is not running, start diagnostics
Write-ColorOutput "Backend is not running or not responding. Starting diagnostics..." "Yellow"
Write-Output ""

# Check 1: Check if port 8124 is in use
Write-ColorOutput "1. Checking if port 8124 is already in use..." "Yellow"
if (Test-PortInUse -Port 8124) {
    Write-ColorOutput "Port 8124 is already in use!" "Red"
    Write-ColorOutput "This could be caused by:" "Yellow"
    Write-ColorOutput "- Another instance of the backend is already running" "Yellow"
    Write-ColorOutput "- Another application is using port 8124" "Yellow"
    
    # Ask if user wants to kill processes using port 8124
    $killProcesses = Read-Host "Do you want to kill processes using port 8124? (y/n)"
    if ($killProcesses -eq "y") {
        Write-ColorOutput "Attempting to kill processes using port 8124..." "Yellow"
        
        # Find processes using port 8124
        $processInfo = netstat -ano | Select-String -Pattern ".*:8124\s.*LISTENING"
        if ($processInfo) {
            $processId = ($processInfo -split '\s+')[-1]
            try {
                Stop-Process -Id $processId -Force
                Write-ColorOutput "Successfully killed process with ID $processId" "Green"
            } catch {
                Write-ColorOutput "Failed to kill process with ID $processId: $_" "Red"
            }
        } else {
            Write-ColorOutput "Could not identify the process using port 8124" "Red"
        }
    }
} else {
    Write-ColorOutput "Port 8124 is available." "Green"
}

# Check 2: Check if Python and Poetry are installed
Write-ColorOutput "2. Checking if Python and Poetry are installed..." "Yellow"
$pythonInstalled = Test-CommandExists "python"
$poetryInstalled = Test-CommandExists "poetry"

if (-not $pythonInstalled) {
    Write-ColorOutput "Python is not installed or not in PATH!" "Red"
    Write-ColorOutput "Please install Python 3.10 or later from https://www.python.org/downloads/" "Yellow"
} else {
    # Check Python version
    $pythonVersion = python --version 2>&1
    Write-ColorOutput "Python is installed: $pythonVersion" "Green"
    
    # Check if version is at least 3.10
    if ($pythonVersion -match "Python (\d+)\.(\d+)") {
        $major = [int]$Matches[1]
        $minor = [int]$Matches[2]
        
        if ($major -lt 3 -or ($major -eq 3 -and $minor -lt 10)) {
            Write-ColorOutput "Python version is too old. Please install Python 3.10 or later." "Red"
        }
    }
}

if (-not $poetryInstalled) {
    Write-ColorOutput "Poetry is not installed or not in PATH!" "Red"
    Write-ColorOutput "Please install Poetry from https://python-poetry.org/docs/#installation" "Yellow"
} else {
    Write-ColorOutput "Poetry is installed." "Green"
}

# Check 3: Check if .env file exists in agent directory
Write-ColorOutput "3. Checking if .env file exists in agent directory..." "Yellow"
$envPath = Join-Path $baseDir "agent\.env"
if (-not (Test-Path $envPath)) {
    Write-ColorOutput ".env file not found in agent directory!" "Red"
    Write-ColorOutput "Creating a basic .env file from example.env..." "Yellow"
    
    # Check if example.env exists
    $exampleEnvPath = Join-Path $baseDir "agent\example.env"
    if (Test-Path $exampleEnvPath) {
        # Copy example.env to .env
        Copy-Item $exampleEnvPath $envPath
        Write-ColorOutput "Created .env file from example.env" "Green"
        Write-ColorOutput "Please edit the .env file to add your API keys" "Yellow"
    } else {
        # Create a basic .env file
        @"
# Basic .env file created by diagnose-backend.ps1
# Please add your API keys below

# OpenAI API Key (Required)
OPENAI_API_KEY=

# Framework Configuration
# Options: langgraph, openai_agents, hybrid
FRAMEWORK=langgraph
DEFAULT_MODEL=gpt-4o

# Optional Logfire configuration
LOGGING_ENABLED=false
"@ | Out-File -FilePath $envPath -Encoding utf8
        
        Write-ColorOutput "Created a basic .env file" "Green"
        Write-ColorOutput "Please edit the .env file to add your API keys" "Yellow"
    }
} else {
    Write-ColorOutput ".env file exists in agent directory." "Green"
    
    # Check if OPENAI_API_KEY is set
    $envContent = Get-Content $envPath -Raw
    if ($envContent -notmatch "OPENAI_API_KEY=.+") {
        Write-ColorOutput "Warning: OPENAI_API_KEY appears to be empty in .env file" "Yellow"
        Write-ColorOutput "Please add your OpenAI API key to the .env file" "Yellow"
    }
}

# Check 4: Try to manually start the backend
Write-ColorOutput "4. Attempting to manually start the backend..." "Yellow"
Write-ColorOutput "This will help identify any specific errors." "Yellow"

# Navigate to the agent directory
Push-Location "$baseDir\agent"

# Install dependencies
Write-ColorOutput "Installing backend dependencies..." "Yellow"
$installResult = Invoke-Expression "poetry install 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "Error installing backend dependencies:" "Red"
    Write-Output $installResult
} else {
    Write-ColorOutput "Dependencies installed successfully." "Green"
    
    # Try to run the custom server
    Write-ColorOutput "Attempting to start the custom server..." "Yellow"
    Write-ColorOutput "This will open a new terminal window. Please check it for any error messages." "Yellow"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k poetry run custom-server" -WindowStyle Normal
    
    Write-ColorOutput "Backend startup attempt complete." "Green"
    Write-ColorOutput "Please check the new terminal window for any error messages." "Yellow"
}

# Return to the original directory
Pop-Location

# Final recommendations
Write-Output ""
Write-ColorOutput "Diagnostics complete. Recommendations:" "Green"
Write-ColorOutput "1. Check the terminal window for specific error messages" "Yellow"
Write-ColorOutput "2. Make sure your .env file contains valid API keys" "Yellow"
Write-ColorOutput "3. Try running 'poetry run custom-server' manually in the agent directory" "Yellow"
Write-ColorOutput "4. If issues persist, try restarting your computer to clear any stuck processes" "Yellow"
Write-ColorOutput "5. Run './scripts/manage-app.ps1 -Action start -Component backend -Wait' to start the backend with detailed logging" "Yellow"

Write-Output ""
Write-ColorOutput "If you need further assistance, please check the documentation or contact support." "Cyan"
