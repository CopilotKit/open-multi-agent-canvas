# PowerShell script for stopping Multi-Agent Canvas services
# This script gracefully stops both the frontend and backend

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

# Display header
Write-ColorOutput "Stopping Multi-Agent Canvas Services" "Yellow"
Write-ColorOutput "==================================" "Yellow"
Write-Output ""

# Stop frontend (Next.js) processes
Write-ColorOutput "Stopping frontend (Next.js)..." "Cyan"
$frontendProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "next" -or $_.CommandLine -match "frontend" }

if ($frontendProcesses) {
    foreach ($process in $frontendProcesses) {
        try {
            $process | Stop-Process -Force
            Write-ColorOutput "Stopped frontend process (PID: $($process.Id))" "Green"
        }
        catch {
            Write-ColorOutput "Failed to stop frontend process (PID: $($process.Id))" "Red"
        }
    }
}
else {
    Write-ColorOutput "No running frontend processes found." "Yellow"
}

# Stop backend (Python/LangGraph) processes
Write-ColorOutput "Stopping backend (MCP Agent)..." "Cyan"
$backendProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "langgraph" -or $_.CommandLine -match "custom-server" -or $_.CommandLine -match "agent" }

if ($backendProcesses) {
    foreach ($process in $backendProcesses) {
        try {
            $process | Stop-Process -Force
            Write-ColorOutput "Stopped backend process (PID: $($process.Id))" "Green"
        }
        catch {
            Write-ColorOutput "Failed to stop backend process (PID: $($process.Id))" "Red"
        }
    }
}
else {
    Write-ColorOutput "No running backend processes found." "Yellow"
}

# Stop any remaining cmd windows that might be running our services
Write-ColorOutput "Checking for remaining terminal windows..." "Cyan"
$cmdProcesses = Get-Process -Name "cmd" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "MCP Agent Backend" -or $_.MainWindowTitle -match "Frontend" }

if ($cmdProcesses) {
    foreach ($process in $cmdProcesses) {
        try {
            $process | Stop-Process -Force
            Write-ColorOutput "Stopped terminal window (PID: $($process.Id))" "Green"
        }
        catch {
            Write-ColorOutput "Failed to stop terminal window (PID: $($process.Id))" "Red"
        }
    }
}
else {
    Write-ColorOutput "No remaining terminal windows found." "Yellow"
}

# Final confirmation
Write-Output ""
Write-ColorOutput "All Multi-Agent Canvas services have been stopped." "Green"
Write-Output ""
Write-Output "Press Enter to exit."
Read-Host
