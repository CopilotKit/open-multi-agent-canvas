@echo off
REM Script to stop all Multi-Agent Canvas services
setlocal enabledelayedexpansion

REM Set colors for better visibility
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "RESET=[0m"

echo %YELLOW%Stopping Multi-Agent Canvas services...%RESET%

REM Find and kill the Node.js process (frontend)
echo Stopping frontend (Next.js)...
taskkill /f /im node.exe >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo %GREEN%Frontend stopped successfully.%RESET%
) else (
    echo %YELLOW%No running frontend process found.%RESET%
)

REM Find and kill the Python process (backend)
echo Stopping backend (MCP Agent)...
taskkill /f /im python.exe >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo %GREEN%Backend stopped successfully.%RESET%
) else (
    echo %YELLOW%No running backend process found.%RESET%
)

echo.
echo %GREEN%All services have been stopped.%RESET%
echo.
echo Press any key to exit.
pause >nul
