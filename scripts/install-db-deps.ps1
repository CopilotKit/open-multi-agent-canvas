# PowerShell script for installing database dependencies
# This script installs the required Python packages for database integration

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
Write-ColorOutput "Installing Database Dependencies" "Green"
Write-ColorOutput "===============================" "Green"
Write-Output ""

# Check if we're in the agent directory
if (-not (Test-Path $agentDir)) {
    Write-ColorOutput "Error: Agent directory not found at $agentDir" "Red"
    exit 1
}

# Navigate to the agent directory
Set-Location $agentDir

# Install the required packages
Write-ColorOutput "Installing psycopg2-binary and python-dotenv..." "Yellow"
poetry add psycopg2-binary python-dotenv

# Check the exit code
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "✓ Dependencies installed successfully!" "Green"
} else {
    Write-ColorOutput "✗ Failed to install dependencies." "Red"
}

Write-Output ""
Write-ColorOutput "Database dependency installation completed." "Green"
