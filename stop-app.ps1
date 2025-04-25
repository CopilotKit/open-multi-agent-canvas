# KB-multi-agent Application Stopper
# This script stops all KB-multi-agent application components

# Display header
Write-Host "KB-multi-agent Application Manager" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Host "Stopping application components..." -ForegroundColor Cyan
Write-Host ""

# Kill any Python processes related to the backend
$backendProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -match "langgraph" -or $_.CommandLine -match "custom-server" -or $_.CommandLine -match "agent"
}

$backendStopped = 0
if ($backendProcesses) {
    foreach ($process in $backendProcesses) {
        Write-Host "Stopping Python process with ID $($process.Id)..." -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        $backendStopped++
    }
}

# Kill any Node.js processes related to the frontend
$frontendProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -match "next" -or $_.CommandLine -match "dev" -or $_.CommandLine -match "frontend"
}

$frontendStopped = 0
if ($frontendProcesses) {
    foreach ($process in $frontendProcesses) {
        Write-Host "Stopping Node.js process with ID $($process.Id)..." -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        $frontendStopped++
    }
}

# Also find and stop any cmd.exe processes that might be hosting the backend or frontend
$cmdProcesses = Get-Process -Name "cmd" -ErrorAction SilentlyContinue | Where-Object { 
    $_.MainWindowTitle -match "KB-multi-agent"
}

$cmdStopped = 0
if ($cmdProcesses) {
    foreach ($process in $cmdProcesses) {
        Write-Host "Stopping cmd process with ID $($process.Id)..." -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        $cmdStopped++
    }
}

# Display summary
Write-Host ""
Write-Host "KB-multi-agent services have been stopped." -ForegroundColor Green
Write-Host "- Backend processes stopped: $backendStopped" -ForegroundColor Cyan
Write-Host "- Frontend processes stopped: $frontendStopped" -ForegroundColor Cyan
Write-Host "- Command windows closed: $cmdStopped" -ForegroundColor Cyan
Write-Host ""
