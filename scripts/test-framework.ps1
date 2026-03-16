# PowerShell script for testing the framework integration
# This script tests the framework selection endpoint and verifies that both LangGraph and OpenAI Agents frameworks work

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

# Function to test the framework selection endpoint
function Test-FrameworkSelection {
    param (
        [Parameter(Mandatory=$true)]
        [string]$BaseUrl,
        
        [Parameter(Mandatory=$true)]
        [string]$Framework
    )
    
    try {
        Write-ColorOutput "Testing framework selection: $Framework" "Yellow"
        
        # Create the request body
        $body = @{
            mode = $Framework
        } | ConvertTo-Json
        
        # Send the request
        $response = Invoke-WebRequest -Uri "$BaseUrl/config/mode" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
        
        # Parse the response
        $data = $response.Content | ConvertFrom-Json
        
        Write-ColorOutput "Framework set to: $($data.mode)" "Green"
        
        # Verify the framework was set correctly
        $healthResponse = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -UseBasicParsing
        $healthData = $healthResponse.Content | ConvertFrom-Json
        
        if ($healthData.framework -eq $Framework) {
            Write-ColorOutput "✅ Framework successfully changed to $Framework" "Green"
            return $true
        }
        else {
            Write-ColorOutput "❌ Framework change failed. Expected $Framework, got $($healthData.framework)" "Red"
            return $false
        }
    }
    catch {
        Write-ColorOutput "❌ Error setting framework to $Framework: $_" "Red"
        return $false
    }
}

# Set script directory as base path
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Display header
Write-ColorOutput "Framework Integration Test" "Green"
Write-ColorOutput "=========================" "Green"
Write-Output ""

# Check if the backend is running
Write-ColorOutput "Checking if backend is running..." "Yellow"
$backendHealthUrl = "http://localhost:8124/health"
$backendHealthResult = Test-UrlAccessible -Url $backendHealthUrl

if (-not $backendHealthResult.Success) {
    Write-ColorOutput "❌ Backend is not running. Please start the backend first." "Red"
    exit 1
}

Write-ColorOutput "✅ Backend is running!" "Green"

# Get the current framework
try {
    $healthResponse = Invoke-WebRequest -Uri $backendHealthUrl -Method GET -UseBasicParsing
    $healthData = $healthResponse.Content | ConvertFrom-Json
    $currentFramework = $healthData.framework
    
    Write-ColorOutput "Current framework: $currentFramework" "Cyan"
    
    # Check available services
    Write-ColorOutput "Available services:" "Yellow"
    foreach ($service in $healthData.services.PSObject.Properties) {
        $status = if ($service.Value.status -eq "ok") { "✅" } else { "❌" }
        Write-ColorOutput "$status $($service.Name): $($service.Value.status)" "Cyan"
    }
}
catch {
    Write-ColorOutput "❌ Error getting current framework: $_" "Red"
    exit 1
}

# Test LangGraph framework
Write-Output ""
$langGraphResult = Test-FrameworkSelection -BaseUrl "http://localhost:8124" -Framework "langgraph"

# Test OpenAI Agents framework
Write-Output ""
$openAiAgentsResult = Test-FrameworkSelection -BaseUrl "http://localhost:8124" -Framework "openai_agents"

# Test Hybrid framework
Write-Output ""
$hybridResult = Test-FrameworkSelection -BaseUrl "http://localhost:8124" -Framework "hybrid"

# Reset to the original framework
Write-Output ""
Write-ColorOutput "Resetting to original framework: $currentFramework" "Yellow"
$resetResult = Test-FrameworkSelection -BaseUrl "http://localhost:8124" -Framework $currentFramework

# Print summary
Write-Output ""
Write-ColorOutput "Test Summary:" "Green"
Write-ColorOutput "=============" "Green"
Write-ColorOutput "LangGraph Framework: $(if ($langGraphResult) { "✅ PASS" } else { "❌ FAIL" })" "Cyan"
Write-ColorOutput "OpenAI Agents Framework: $(if ($openAiAgentsResult) { "✅ PASS" } else { "❌ FAIL" })" "Cyan"
Write-ColorOutput "Hybrid Framework: $(if ($hybridResult) { "✅ PASS" } else { "❌ FAIL" })" "Cyan"
Write-ColorOutput "Reset to Original: $(if ($resetResult) { "✅ PASS" } else { "❌ FAIL" })" "Cyan"

# Overall result
if ($langGraphResult -and $openAiAgentsResult -and $hybridResult -and $resetResult) {
    Write-ColorOutput "✅ All framework tests passed!" "Green"
}
else {
    Write-ColorOutput "❌ Some framework tests failed." "Red"
}

Write-Output ""
Write-Output "Press Enter to exit."
Read-Host
