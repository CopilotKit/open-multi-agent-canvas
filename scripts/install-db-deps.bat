@echo off
REM Batch wrapper for PowerShell database dependency installation script
powershell -ExecutionPolicy Bypass -File "%~dp0\install-db-deps.ps1"
