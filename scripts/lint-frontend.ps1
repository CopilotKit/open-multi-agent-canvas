# PowerShell script for linting the frontend code
# This script runs ESLint with the --fix option to automatically fix linting issues

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
$frontendDir = Join-Path $scriptDir "frontend"

# Display header
Write-ColorOutput "Frontend Linting" "Green"
Write-ColorOutput "================" "Green"
Write-Output ""

# Check if we're in the frontend directory
if (-not (Test-Path $frontendDir)) {
    Write-ColorOutput "Error: Frontend directory not found at $frontendDir" "Red"
    exit 1
}

# Navigate to the frontend directory
Set-Location $frontendDir

# Run ESLint with auto-fix
Write-ColorOutput "Running ESLint with auto-fix..." "Yellow"
pnpm eslint --fix "src/**/*.{js,jsx,ts,tsx}"

# Check the exit code
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "✓ Linting completed successfully!" "Green"
} else {
    Write-ColorOutput "✗ Linting completed with errors. Please fix the remaining issues manually." "Red"
}

# Run Prettier
Write-ColorOutput "Running Prettier to format code..." "Yellow"
& pnpm prettier --write "src/**/*.{js,jsx,ts,tsx,css,md,json}"

# Check the exit code
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "✓ Formatting completed successfully!" "Green"
} else {
    Write-ColorOutput "✗ Formatting completed with errors." "Red"
}

Write-Output ""
Write-ColorOutput "Linting and formatting process completed." "Green"
