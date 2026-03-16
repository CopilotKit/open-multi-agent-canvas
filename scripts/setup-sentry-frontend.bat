@echo off
REM Script to set up Sentry in the frontend
cd /d "%~dp0\.."
powershell -ExecutionPolicy Bypass -File "%~dp0\setup-sentry-frontend.ps1"
