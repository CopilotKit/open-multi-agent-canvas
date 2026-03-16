# PowerShell module with common utility functions for KB-multi-agent scripts
# This module provides functions used across multiple scripts

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
        $statusCode = [int]($response.StatusCode)
        $response.Close()
        return @{
            Success = $true
            StatusCode = $statusCode
        }
    }
    catch [System.Net.WebException] {
        if ($_.Exception.Response -ne $null) {
            return @{
                Success = $false
                StatusCode = [int]($_.Exception.Response.StatusCode)
                Error = $_.Exception.Message
            }
        }
        else {
            return @{
                Success = $false
                StatusCode = 0
                Error = $_.Exception.Message
            }
        }
    }
    catch {
        return @{
            Success = $false
            StatusCode = 0
            Error = $_.Exception.Message
        }
    }
}

# Function to check prerequisites
function Test-Prerequisites {
    param (
        [switch]$Backend,
        [switch]$Frontend,
        [switch]$Database
    )

    $allPrerequisitesMet = $true

    # Check backend prerequisites
    if ($Backend) {
        # Check if Poetry is installed
        if (-not (Test-CommandExists "poetry")) {
            Write-ColorOutput "Error: Poetry is not installed or not in PATH" "Red"
            Write-Output "Please install Poetry from https://python-poetry.org/docs/#installation"
            $allPrerequisitesMet = $false
        }
    }

    # Check frontend prerequisites
    if ($Frontend) {
        # Check if PNPM is installed
        if (-not (Test-CommandExists "pnpm")) {
            Write-ColorOutput "Error: PNPM is not installed or not in PATH" "Red"
            Write-Output "Please install PNPM from https://pnpm.io/installation"
            $allPrerequisitesMet = $false
        }
    }

    # Check database prerequisites
    if ($Database) {
        # Check if Node.js is installed
        if (-not (Test-CommandExists "node")) {
            Write-ColorOutput "Error: Node.js is not installed or not in PATH" "Red"
            Write-Output "Please install Node.js from https://nodejs.org/"
            $allPrerequisitesMet = $false
        }
    }

    return $allPrerequisitesMet
}

# Function to get the base directory
function Get-BaseDirectory {
    return Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
}

# Function to start the backend
function Start-Backend {
    param (
        [string]$ScriptDir = (Get-BaseDirectory),
        [switch]$Wait = $false
    )

    Write-ColorOutput "Starting backend (MCP Agent)..." "Yellow"
    $backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $ScriptDir\agent && echo Installing dependencies... && poetry install && echo. && echo Starting custom server with health endpoint... && (poetry run custom-server || (echo Failed to start custom server, trying standard server... && poetry run demo))" -PassThru -WindowStyle Normal

    if ($Wait) {
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
            $result = Test-UrlAccessible -Url $backendHealthUrl

            if ($result.Success) {
                $backendReady = $true
                Write-ColorOutput "Backend is ready! (Status: $($result.StatusCode))" "Green"
            }
            else {
                Write-Output "Waiting for backend to start... (Attempt $attempts of $maxAttempts)"
                Start-Sleep -Seconds 2
            }
        }

        if (-not $backendReady) {
            Write-ColorOutput "Warning: Backend did not start within the expected time." "Yellow"
            Write-ColorOutput "Please check the backend terminal window for errors." "Yellow"
        }
    }

    return $backendProcess
}

# Function to start the frontend
function Start-Frontend {
    param (
        [string]$ScriptDir = (Get-BaseDirectory),
        [switch]$Wait = $false
    )

    Write-ColorOutput "Starting frontend (Next.js)..." "Yellow"
    $frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $ScriptDir\frontend && echo Installing dependencies... && pnpm install && echo. && echo Starting Next.js development server... && pnpm run dev" -PassThru -WindowStyle Normal

    if ($Wait) {
        # Wait for frontend to start
        Write-Output "Waiting for frontend to initialize..."
        $frontendUrl = "http://localhost:3000"
        $frontendReady = $false
        $attempts = 0
        $maxAttempts = 30

        while (-not $frontendReady -and $attempts -lt $maxAttempts) {
            $attempts++
            $result = Test-UrlAccessible -Url $frontendUrl

            if ($result.Success) {
                $frontendReady = $true
                Write-ColorOutput "Frontend is ready! (Status: $($result.StatusCode))" "Green"
            }
            else {
                Write-Output "Waiting for frontend to start... (Attempt $attempts of $maxAttempts)"
                Start-Sleep -Seconds 2
            }
        }

        if (-not $frontendReady) {
            Write-ColorOutput "Warning: Frontend did not start within the expected time." "Yellow"
            Write-ColorOutput "The application may still work if the frontend starts later." "Yellow"
        }
    }

    return $frontendProcess
}

# Function to stop the backend
function Stop-Backend {
    Write-ColorOutput "Stopping backend (MCP Agent)..." "Cyan"
    $backendProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "langgraph" -or $_.CommandLine -match "custom-server" -or $_.CommandLine -match "agent" }

    $stoppedCount = 0
    if ($backendProcesses) {
        foreach ($process in $backendProcesses) {
            try {
                $process | Stop-Process -Force
                Write-ColorOutput "Stopped backend process (PID: $($process.Id))" "Green"
                $stoppedCount++
            }
            catch {
                Write-ColorOutput "Failed to stop backend process (PID: $($process.Id))" "Red"
            }
        }
    }
    else {
        Write-ColorOutput "No running backend processes found." "Yellow"
    }

    return $stoppedCount
}

# Function to stop the frontend
function Stop-Frontend {
    Write-ColorOutput "Stopping frontend (Next.js)..." "Cyan"
    $frontendProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "next" -or $_.CommandLine -match "frontend" }

    $stoppedCount = 0
    if ($frontendProcesses) {
        foreach ($process in $frontendProcesses) {
            try {
                $process | Stop-Process -Force
                Write-ColorOutput "Stopped frontend process (PID: $($process.Id))" "Green"
                $stoppedCount++
            }
            catch {
                Write-ColorOutput "Failed to stop frontend process (PID: $($process.Id))" "Red"
            }
        }
    }
    else {
        Write-ColorOutput "No running frontend processes found." "Yellow"
    }

    return $stoppedCount
}

# Function to check backend status
function Test-BackendStatus {
    param (
        [switch]$Detailed = $false
    )

    Write-ColorOutput "Checking backend status..." "Yellow"
    $backendHealthUrl = "http://localhost:8124/health"
    $result = Test-UrlAccessible -Url $backendHealthUrl

    if ($result.Success) {
        Write-ColorOutput "Backend is running! (Status: $($result.StatusCode))" "Green"
        
        if ($Detailed) {
            # Try to get more information
            try {
                $webClient = New-Object System.Net.WebClient
                $response = $webClient.DownloadString($backendHealthUrl)
                Write-Output "Response from backend:"
                Write-Output $response
            }
            catch {
                Write-ColorOutput "Could not retrieve detailed information: $($_.Exception.Message)" "Yellow"
            }
        }
        
        return $true
    }
    else {
        Write-ColorOutput "Backend is not running or not accessible." "Red"
        Write-ColorOutput "Error: $($result.Error)" "Red"
        return $false
    }
}

# Function to check frontend status
function Test-FrontendStatus {
    Write-ColorOutput "Checking frontend status..." "Yellow"
    $frontendUrl = "http://localhost:3000"
    $result = Test-UrlAccessible -Url $frontendUrl

    if ($result.Success) {
        Write-ColorOutput "Frontend is running! (Status: $($result.StatusCode))" "Green"
        return $true
    }
    else {
        Write-ColorOutput "Frontend is not running or not accessible." "Red"
        Write-ColorOutput "Error: $($result.Error)" "Red"
        return $false
    }
}

# Function to initialize the database
function Initialize-Database {
    param (
        [string]$ScriptDir = (Get-BaseDirectory)
    )

    $agentDir = Join-Path $ScriptDir "agent"

    # Check if we're in the agent directory
    if (-not (Test-Path $agentDir)) {
        Write-ColorOutput "Error: Agent directory not found at $agentDir" "Red"
        return $false
    }

    # Navigate to the agent directory
    Push-Location $agentDir

    # Run the database initialization script
    Write-ColorOutput "Running database initialization script..." "Yellow"
    poetry run python -m mcp_agent.database.init_db

    # Check the exit code
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Database initialized successfully!" "Green"
        $success = $true
    } else {
        Write-ColorOutput "✗ Database initialization failed." "Red"
        $success = $false
    }

    # Return to the original directory
    Pop-Location

    return $success
}

# Export the functions
Export-ModuleMember -Function Write-ColorOutput
Export-ModuleMember -Function Test-CommandExists
Export-ModuleMember -Function Test-UrlAccessible
Export-ModuleMember -Function Test-Prerequisites
Export-ModuleMember -Function Get-BaseDirectory
Export-ModuleMember -Function Start-Backend
Export-ModuleMember -Function Start-Frontend
Export-ModuleMember -Function Stop-Backend
Export-ModuleMember -Function Stop-Frontend
Export-ModuleMember -Function Test-BackendStatus
Export-ModuleMember -Function Test-FrontendStatus
Export-ModuleMember -Function Initialize-Database
