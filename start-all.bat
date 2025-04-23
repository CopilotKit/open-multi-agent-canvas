@echo off
REM Launch script for Multi-Agent Canvas: starts both frontend and backend
setlocal enabledelayedexpansion

REM Set colors for better visibility
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "RESET=[0m"

REM Set PYTHONPATH to include the agent directory
set PYTHONPATH=%~dp0agent;%PYTHONPATH%

echo %GREEN%Multi-Agent Canvas Startup%RESET%
echo ===========================
echo.

REM Check if Poetry is installed
where poetry >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%Error: Poetry is not installed or not in PATH%RESET%
    echo Please install Poetry from https://python-poetry.org/docs/#installation
    pause
    exit /b 1
)

REM Check if PNPM is installed
where pnpm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %RED%Error: PNPM is not installed or not in PATH%RESET%
    echo Please install PNPM from https://pnpm.io/installation
    pause
    exit /b 1
)

echo %YELLOW%Starting backend (MCP Agent)...%RESET%

REM Start backend (agent) with custom server in a new window
start "MCP Agent Backend" cmd /k "cd /d %~dp0agent && echo Installing dependencies... && poetry install && echo. && echo %GREEN%Starting custom server with health endpoint...%RESET% && poetry run custom-server || (echo %RED%Failed to start custom server, trying standard server...%RESET% && poetry run demo)"

REM Wait a moment for the backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo %YELLOW%Starting frontend (Next.js)...%RESET%

REM Start frontend (Next.js) in a new window
start "Frontend" cmd /k "cd /d %~dp0frontend && echo Installing dependencies... && pnpm install && echo. && echo %GREEN%Starting Next.js development server...%RESET% && pnpm run dev"

REM Display information about the running services
echo.
echo %GREEN%Multi-Agent Canvas is starting!%RESET%
echo.
echo Backend API: http://localhost:8123
echo Backend Health: http://localhost:8123/health
echo Frontend: http://localhost:3000
echo.
echo %YELLOW%Note: It may take a few moments for both services to fully initialize.%RESET%
echo %YELLOW%Check the opened terminal windows for detailed progress.%RESET%
echo.
echo Press any key to close this window. The services will continue running.
pause >nul
