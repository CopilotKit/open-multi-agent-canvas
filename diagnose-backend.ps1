# PowerShell shortcut to diagnose backend issues
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptDir\scripts\diagnose-backend.ps1"
