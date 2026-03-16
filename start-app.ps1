# PowerShell shortcut to start the application
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptDir\scripts\start-app.ps1"
