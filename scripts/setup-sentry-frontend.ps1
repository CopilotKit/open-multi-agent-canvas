# PowerShell script to set up Sentry in the frontend
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
Set-Location -Path $scriptDir

Write-ColorOutput "Setting up Sentry in the frontend..." "Cyan"

# Check if frontend directory exists
if (-not (Test-Path -Path "frontend")) {
    Write-ColorOutput "Error: frontend directory not found!" "Red"
    Write-ColorOutput "Make sure you're running this script from the project root directory." "Yellow"
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}

# Change to the frontend directory
Set-Location -Path "frontend"

# Check if package.json exists
if (-not (Test-Path -Path "package.json")) {
    Write-ColorOutput "Error: package.json not found in frontend directory!" "Red"
    Write-ColorOutput "Make sure the frontend project is properly set up." "Yellow"
    Set-Location -Path ".."
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}

# Run the Sentry wizard
Write-ColorOutput "Running Sentry wizard..." "Yellow"
try {
    npx @sentry/wizard@latest -i nextjs --saas --org kb-konsult-partner-ab --project kb-agent-canvas-frontend

    Write-ColorOutput "Sentry setup complete!" "Green"
    Write-ColorOutput "The Sentry SDK has been added to your Next.js application." "Green"
    Write-ColorOutput "You can now use Sentry to track errors and performance in your frontend." "Green"
} catch {
    Write-ColorOutput "Error running Sentry wizard: $_" "Red"
    Write-ColorOutput "You can manually set up Sentry by following these steps:" "Yellow"
    Write-ColorOutput "1. Install Sentry packages: npm install @sentry/nextjs" "Yellow"
    Write-ColorOutput "2. Create sentry.client.config.js, sentry.server.config.js, and sentry.edge.config.js files" "Yellow"
    Write-ColorOutput "3. Update next.config.js to use the Sentry webpack plugin" "Yellow"
    Write-ColorOutput "For more details, see: https://docs.sentry.io/platforms/javascript/guides/nextjs/" "Yellow"
}

# Return to the original directory
Set-Location -Path ".."

Write-Host "Press Enter to exit..."
Read-Host
