# PowerShell script for checking the health of Multi-Agent Canvas services
# This script verifies that both frontend and backend are running and correctly integrated

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

# Set script directory as base path
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Display header
Write-ColorOutput "Multi-Agent Canvas Health Check" "Green"
Write-ColorOutput "===============================" "Green"
Write-Output ""

# Check backend health
Write-ColorOutput "Checking backend (MCP Agent)..." "Yellow"
$backendHealthUrl = "http://localhost:8123/health"
$backendApiUrl = "http://localhost:8123"
$backendDocsUrl = "http://localhost:8123/docs"

$backendHealthResult = Test-UrlAccessible -Url $backendHealthUrl
$backendApiResult = Test-UrlAccessible -Url $backendApiUrl
$backendDocsResult = Test-UrlAccessible -Url $backendDocsUrl

if ($backendHealthResult.Success) {
    Write-ColorOutput "✓ Backend health endpoint is accessible (Status: $($backendHealthResult.StatusCode))" "Green"
}
else {
    Write-ColorOutput "✗ Backend health endpoint is not accessible: $($backendHealthResult.Error)" "Red"
}

if ($backendApiResult.Success) {
    Write-ColorOutput "✓ Backend API is accessible (Status: $($backendApiResult.StatusCode))" "Green"
}
else {
    Write-ColorOutput "✗ Backend API is not accessible: $($backendApiResult.Error)" "Red"
}

if ($backendDocsResult.Success) {
    Write-ColorOutput "✓ Backend API documentation is accessible (Status: $($backendDocsResult.StatusCode))" "Green"
}
else {
    Write-ColorOutput "✗ Backend API documentation is not accessible: $($backendDocsResult.Error)" "Red"
}

# Check frontend
Write-ColorOutput "Checking frontend (Next.js)..." "Yellow"
$frontendUrl = "http://localhost:3000"
$frontendResult = Test-UrlAccessible -Url $frontendUrl

if ($frontendResult.Success) {
    Write-ColorOutput "✓ Frontend is accessible (Status: $($frontendResult.StatusCode))" "Green"
}
else {
    Write-ColorOutput "✗ Frontend is not accessible: $($frontendResult.Error)" "Red"
}

# Check frontend configuration
Write-ColorOutput "Checking frontend configuration..." "Yellow"
$envPath = "$scriptDir\frontend\.env"

if (Test-Path $envPath) {
    $envContent = Get-Content -Path $envPath -ErrorAction SilentlyContinue
    
    if ($envContent -match "NEXT_PUBLIC_BACKEND_URL=http://localhost:8123") {
        Write-ColorOutput "✓ Frontend is correctly configured to connect to the backend" "Green"
    }
    else {
        Write-ColorOutput "✗ Frontend .env file does not contain the correct backend URL" "Red"
        Write-ColorOutput "  Please ensure NEXT_PUBLIC_BACKEND_URL=http://localhost:8123 is in the frontend/.env file" "Yellow"
    }
}
else {
    Write-ColorOutput "✗ Frontend .env file not found" "Red"
    Write-ColorOutput "  Please create a .env file in the frontend directory with NEXT_PUBLIC_BACKEND_URL=http://localhost:8123" "Yellow"
}

# Check running processes
Write-ColorOutput "Checking running processes..." "Yellow"

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-ColorOutput "✓ Node.js processes are running (Count: $($nodeProcesses.Count))" "Green"
}
else {
    Write-ColorOutput "✗ No Node.js processes found - frontend might not be running" "Red"
}

$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    Write-ColorOutput "✓ Python processes are running (Count: $($pythonProcesses.Count))" "Green"
}
else {
    Write-ColorOutput "✗ No Python processes found - backend might not be running" "Red"
}

# Summary
Write-Output ""
if ($backendHealthResult.Success -and $frontendResult.Success) {
    Write-ColorOutput "✓ Multi-Agent Canvas is running correctly!" "Green"
    Write-Output ""
    Write-ColorOutput "You can access the application at:" "Cyan"
    Write-ColorOutput "  Frontend: http://localhost:3000" "Cyan"
    Write-ColorOutput "  Backend API: http://localhost:8123" "Cyan"
    Write-ColorOutput "  Backend Health: http://localhost:8123/health" "Cyan"
    Write-ColorOutput "  API Documentation: http://localhost:8123/docs" "Cyan"
}
else {
    Write-ColorOutput "✗ Multi-Agent Canvas is not running correctly" "Red"
    Write-Output ""
    Write-ColorOutput "Please check the error messages above and try restarting the application." "Yellow"
    Write-ColorOutput "You can use start-all.ps1 to restart both services." "Yellow"
}

Write-Output ""
Write-Output "Press Enter to exit."
Read-Host
