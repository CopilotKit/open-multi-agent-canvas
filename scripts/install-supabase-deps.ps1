# PowerShell script for installing Supabase dependencies
# This script installs the required packages for Supabase integration

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
$frontendDir = Join-Path $scriptDir "frontend"

# Display header
Write-ColorOutput "Installing Supabase Dependencies" "Green"
Write-ColorOutput "===============================" "Green"
Write-Output ""

# Install backend dependencies
Write-ColorOutput "Installing backend dependencies..." "Yellow"
if (Test-Path $agentDir) {
    Set-Location $agentDir
    
    # Install the required packages
    Write-ColorOutput "Installing requests package for Python..." "Yellow"
    poetry add requests
    
    # Check the exit code
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Backend dependencies installed successfully!" "Green"
    } else {
        Write-ColorOutput "✗ Failed to install backend dependencies." "Red"
    }
} else {
    Write-ColorOutput "Error: Agent directory not found at $agentDir" "Red"
}

# Install frontend dependencies
Write-ColorOutput "Installing frontend dependencies..." "Yellow"
if (Test-Path $frontendDir) {
    Set-Location $frontendDir
    
    # Install the required packages
    Write-ColorOutput "Installing @supabase/supabase-js package..." "Yellow"
    pnpm add @supabase/supabase-js
    
    # Check the exit code
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Frontend dependencies installed successfully!" "Green"
    } else {
        Write-ColorOutput "✗ Failed to install frontend dependencies." "Red"
    }
} else {
    Write-ColorOutput "Error: Frontend directory not found at $frontendDir" "Red"
}

Write-Output ""
Write-ColorOutput "Supabase dependency installation completed." "Green"
