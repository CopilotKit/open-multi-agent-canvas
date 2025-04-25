# PowerShell script for initializing the database
# This script runs the database initialization script

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

# Set script directory as base path
$scriptDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$agentDir = Join-Path $scriptDir "agent"

# Display header
Write-ColorOutput "Database Initialization" "Green"
Write-ColorOutput "======================" "Green"
Write-Output ""

# Check if we're in the agent directory
if (-not (Test-Path $agentDir)) {
    Write-ColorOutput "Error: Agent directory not found at $agentDir" "Red"
    exit 1
}

# Navigate to the agent directory
Set-Location $agentDir

# Run the database initialization script
Write-ColorOutput "Running database initialization script..." "Yellow"
poetry run python -m mcp_agent.database.init_db

# Check the exit code
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "✓ Database initialized successfully!" "Green"
} else {
    Write-ColorOutput "✗ Database initialization failed." "Red"
}

Write-Output ""
Write-ColorOutput "Database initialization process completed." "Green"
