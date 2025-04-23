@echo off
REM Script to check the health of Multi-Agent Canvas services
setlocal enabledelayedexpansion

REM Set colors for better visibility
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "CYAN=[96m"
set "RESET=[0m"

echo %GREEN%Multi-Agent Canvas Health Check%RESET%
echo %GREEN%===============================%RESET%
echo.

REM Check backend health
echo %YELLOW%Checking backend (MCP Agent)...%RESET%
curl -s -o nul -w "%%{http_code}" http://localhost:8123/health > temp.txt
set /p HEALTH_STATUS=<temp.txt
del temp.txt

if "%HEALTH_STATUS%"=="200" (
    echo %GREEN%✓ Backend health endpoint is accessible (Status: %HEALTH_STATUS%)%RESET%
) else (
    echo %RED%✗ Backend health endpoint is not accessible%RESET%
)

REM Check backend API
curl -s -o nul -w "%%{http_code}" http://localhost:8123 > temp.txt
set /p API_STATUS=<temp.txt
del temp.txt

if "%API_STATUS%"=="200" (
    echo %GREEN%✓ Backend API is accessible (Status: %API_STATUS%)%RESET%
) else (
    echo %RED%✗ Backend API is not accessible%RESET%
)

REM Check frontend
echo %YELLOW%Checking frontend (Next.js)...%RESET%
curl -s -o nul -w "%%{http_code}" http://localhost:3000 > temp.txt
set /p FRONTEND_STATUS=<temp.txt
del temp.txt

if "%FRONTEND_STATUS%"=="200" (
    echo %GREEN%✓ Frontend is accessible (Status: %FRONTEND_STATUS%)%RESET%
) else (
    echo %RED%✗ Frontend is not accessible%RESET%
)

REM Check frontend configuration
echo %YELLOW%Checking frontend configuration...%RESET%
findstr /C:"NEXT_PUBLIC_BACKEND_URL=http://localhost:8123" "%~dp0frontend\.env" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo %GREEN%✓ Frontend is correctly configured to connect to the backend%RESET%
) else (
    echo %RED%✗ Frontend .env file does not contain the correct backend URL%RESET%
    echo %YELLOW%  Please ensure NEXT_PUBLIC_BACKEND_URL=http://localhost:8123 is in the frontend/.env file%RESET%
)

REM Check running processes
echo %YELLOW%Checking running processes...%RESET%
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "node.exe" >NUL
if %ERRORLEVEL% equ 0 (
    echo %GREEN%✓ Node.js processes are running%RESET%
) else (
    echo %RED%✗ No Node.js processes found - frontend might not be running%RESET%
)

tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I "python.exe" >NUL
if %ERRORLEVEL% equ 0 (
    echo %GREEN%✓ Python processes are running%RESET%
) else (
    echo %RED%✗ No Python processes found - backend might not be running%RESET%
)

REM Summary
echo.
if "%HEALTH_STATUS%"=="200" if "%FRONTEND_STATUS%"=="200" (
    echo %GREEN%✓ Multi-Agent Canvas is running correctly!%RESET%
    echo.
    echo %CYAN%You can access the application at:%RESET%
    echo %CYAN%  Frontend: http://localhost:3000%RESET%
    echo %CYAN%  Backend API: http://localhost:8123%RESET%
    echo %CYAN%  Backend Health: http://localhost:8123/health%RESET%
    echo %CYAN%  API Documentation: http://localhost:8123/docs%RESET%
) else (
    echo %RED%✗ Multi-Agent Canvas is not running correctly%RESET%
    echo.
    echo %YELLOW%Please check the error messages above and try restarting the application.%RESET%
    echo %YELLOW%You can use start-all.bat to restart both services.%RESET%
)

echo.
echo Press any key to exit.
pause >nul
