# PowerShell script for managing the KB-multi-agent application
# This script provides a unified interface for starting, stopping, and checking the application

param (
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "check")]
    [string]$Action = "start",
    
    [Parameter()]
    [ValidateSet("all", "backend", "frontend", "database")]
    [string]$Component = "all",
    
    [Parameter()]
    [switch]$Wait = $false,
    
    [Parameter()]
    [switch]$Detailed = $false
)

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
Write-ColorOutput "KB-multi-agent Application Management" "Green"
Write-ColorOutput "===================================" "Green"
Write-Output ""
Write-ColorOutput "Action: $Action" "Cyan"
Write-ColorOutput "Component: $Component" "Cyan"
Write-Output ""

# Check prerequisites based on component
$checkBackend = $Component -eq "all" -or $Component -eq "backend"
$checkFrontend = $Component -eq "all" -or $Component -eq "frontend"
$checkDatabase = $Component -eq "all" -or $Component -eq "database"

if (-not (Test-Prerequisites -Backend:$checkBackend -Frontend:$checkFrontend -Database:$checkDatabase)) {
    Write-ColorOutput "Please install the required dependencies and try again." "Red"
    exit 1
}

# Perform the requested action
switch ($Action) {
    "start" {
        # Start the requested components
        $backendProcess = $null
        $frontendProcess = $null
        
        if ($Component -eq "all" -or $Component -eq "backend") {
            # Check if backend is already running
            $backendRunning = Test-BackendStatus
            
            if (-not $backendRunning) {
                $backendProcess = Start-Backend -ScriptDir $baseDir -Wait:$Wait
            } else {
                Write-ColorOutput "Backend is already running." "Yellow"
            }
        }
        
        if ($Component -eq "all" -or $Component -eq "frontend") {
            # Check if frontend is already running
            $frontendRunning = Test-FrontendStatus
            
            if (-not $frontendRunning) {
                $frontendProcess = Start-Frontend -ScriptDir $baseDir -Wait:$Wait
            } else {
                Write-ColorOutput "Frontend is already running." "Yellow"
            }
        }
        
        if ($Component -eq "all" -or $Component -eq "database") {
            # Initialize the database
            Initialize-Database -ScriptDir $baseDir
        }
        
        # Display information about the running services
        Write-Output ""
        Write-ColorOutput "KB-multi-agent is starting!" "Green"
        Write-Output ""
        Write-ColorOutput "Backend API: http://localhost:8124" "Cyan"
        Write-ColorOutput "Backend Health: http://localhost:8124/health" "Cyan"
        Write-ColorOutput "Frontend: http://localhost:3000" "Cyan"
        Write-Output ""
        Write-ColorOutput "Note: It may take a few moments for both services to fully initialize." "Yellow"
        Write-Output ""
        
        # Keep the script running to monitor the processes if wait is specified
        if ($Wait -and ($backendProcess -or $frontendProcess)) {
            Write-ColorOutput "Press Ctrl+C to exit this monitor (services will continue running)." "Yellow"
            Write-Output ""
            
            try {
                while ($true) {
                    Start-Sleep -Seconds 10
                    
                    # Check if processes are still running
                    if ($backendProcess -and $backendProcess.HasExited) {
                        Write-ColorOutput "Warning: Backend process has exited." "Red"
                    }
                    
                    if ($frontendProcess -and $frontendProcess.HasExited) {
                        Write-ColorOutput "Warning: Frontend process has exited." "Red"
                    }
                }
            }
            catch {
                Write-Output ""
                Write-ColorOutput "Script interrupted. The services will continue running in their windows." "Yellow"
            }
        }
    }
    
    "stop" {
        # Stop the requested components
        if ($Component -eq "all" -or $Component -eq "frontend") {
            $stoppedCount = Stop-Frontend
            
            if ($stoppedCount -gt 0) {
                Write-ColorOutput "Frontend stopped successfully." "Green"
            }
        }
        
        if ($Component -eq "all" -or $Component -eq "backend") {
            $stoppedCount = Stop-Backend
            
            if ($stoppedCount -gt 0) {
                Write-ColorOutput "Backend stopped successfully." "Green"
            }
        }
        
        Write-Output ""
        Write-ColorOutput "KB-multi-agent services have been stopped." "Green"
    }
    
    "restart" {
        # Restart the requested components
        if ($Component -eq "all" -or $Component -eq "backend") {
            Write-ColorOutput "Restarting backend..." "Yellow"
            Stop-Backend | Out-Null
            Start-Sleep -Seconds 2  # Wait for processes to fully stop
            Start-Backend -ScriptDir $baseDir -Wait:$Wait | Out-Null
        }
        
        if ($Component -eq "all" -or $Component -eq "frontend") {
            Write-ColorOutput "Restarting frontend..." "Yellow"
            Stop-Frontend | Out-Null
            Start-Sleep -Seconds 2  # Wait for processes to fully stop
            Start-Frontend -ScriptDir $baseDir -Wait:$Wait | Out-Null
        }
        
        if ($Component -eq "all" -or $Component -eq "database") {
            # Re-initialize the database
            Initialize-Database -ScriptDir $baseDir
        }
        
        Write-Output ""
        Write-ColorOutput "KB-multi-agent services have been restarted." "Green"
    }
    
    "status" {
        # Check the status of the requested components
        if ($Component -eq "all" -or $Component -eq "backend") {
            Test-BackendStatus -Detailed:$Detailed
        }
        
        if ($Component -eq "all" -or $Component -eq "frontend") {
            Test-FrontendStatus
        }
        
        if ($Component -eq "all" -or $Component -eq "database") {
            # Check database status
            Write-ColorOutput "Checking database status..." "Yellow"
            
            try {
                $backendUrl = "http://localhost:8124"
                $response = Invoke-WebRequest -Uri "$backendUrl/database/status" -Method GET -ErrorAction Stop
                
                if ($response.StatusCode -eq 200) {
                    Write-ColorOutput "Database is connected!" "Green"
                    
                    if ($Detailed) {
                        Write-Output "Database status:"
                        Write-Output $response.Content
                    }
                } else {
                    Write-ColorOutput "Database status check returned: $($response.StatusCode)" "Yellow"
                }
            } catch {
                Write-ColorOutput "Could not check database status: $_" "Red"
            }
        }
    }
    
    "check" {
        # Comprehensive health check
        Write-ColorOutput "Performing comprehensive health check..." "Yellow"
        
        # Check backend
        $backendOk = Test-BackendStatus -Detailed:$Detailed
        
        # Check frontend
        $frontendOk = Test-FrontendStatus
        
        # Check database
        $databaseOk = $false
        Write-ColorOutput "Checking database connection..." "Yellow"
        
        try {
            $backendUrl = "http://localhost:8124"
            $response = Invoke-WebRequest -Uri "$backendUrl/database/status" -Method GET -ErrorAction Stop
            
            if ($response.StatusCode -eq 200) {
                Write-ColorOutput "Database is connected!" "Green"
                $databaseOk = $true
                
                if ($Detailed) {
                    Write-Output "Database status:"
                    Write-Output $response.Content
                }
            } else {
                Write-ColorOutput "Database status check returned: $($response.StatusCode)" "Yellow"
            }
        } catch {
            Write-ColorOutput "Could not check database status: $_" "Red"
        }
        
        # Check frontend-backend integration
        $integrationOk = $false
        if ($backendOk -and $frontendOk) {
            Write-ColorOutput "Checking frontend-backend integration..." "Yellow"
            
            # Check if frontend .env has the correct backend URL
            $envPath = Join-Path $baseDir "frontend\.env"
            $envContent = Get-Content -Path $envPath -ErrorAction SilentlyContinue
            
            if ($envContent -match "NEXT_PUBLIC_BACKEND_URL=http://localhost:8124") {
                Write-ColorOutput "Frontend is correctly configured to connect to the backend!" "Green"
                $integrationOk = $true
            } else {
                Write-ColorOutput "Warning: Frontend .env file might not be properly configured." "Yellow"
                Write-ColorOutput "Please ensure NEXT_PUBLIC_BACKEND_URL=http://localhost:8124 is in the frontend/.env file." "Yellow"
            }
        }
        
        # Display summary
        Write-Output ""
        Write-ColorOutput "Health Check Summary:" "Cyan"
        Write-ColorOutput "-------------------" "Cyan"
        Write-ColorOutput "Backend: $(if ($backendOk) { "✓ OK" } else { "✗ Not Running" })" $(if ($backendOk) { "Green" } else { "Red" })
        Write-ColorOutput "Frontend: $(if ($frontendOk) { "✓ OK" } else { "✗ Not Running" })" $(if ($frontendOk) { "Green" } else { "Red" })
        Write-ColorOutput "Database: $(if ($databaseOk) { "✓ Connected" } else { "✗ Not Connected" })" $(if ($databaseOk) { "Green" } else { "Red" })
        Write-ColorOutput "Integration: $(if ($integrationOk) { "✓ Configured" } else { "✗ Not Verified" })" $(if ($integrationOk) { "Green" } else { "Yellow" })
        
        # Provide recommendations if there are issues
        if (-not ($backendOk -and $frontendOk -and $databaseOk -and $integrationOk)) {
            Write-Output ""
            Write-ColorOutput "Recommendations:" "Yellow"
            
            if (-not $backendOk) {
                Write-ColorOutput "- Start the backend: ./scripts/manage-app.ps1 start backend" "Yellow"
            }
            
            if (-not $frontendOk) {
                Write-ColorOutput "- Start the frontend: ./scripts/manage-app.ps1 start frontend" "Yellow"
            }
            
            if (-not $databaseOk) {
                Write-ColorOutput "- Initialize the database: ./scripts/manage-app.ps1 start database" "Yellow"
            }
            
            if (-not $integrationOk) {
                Write-ColorOutput "- Check frontend .env configuration" "Yellow"
            }
        }
    }
}
