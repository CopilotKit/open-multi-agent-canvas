@echo off
REM Install the agent package in development mode

cd /d %~dp0agent
poetry install
poetry run pip install -e .

echo Agent package installed in development mode.
pause
