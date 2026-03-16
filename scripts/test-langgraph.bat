@echo off
cd agent
poetry run langgraph dev --config langgraph.json --host localhost --port 8123 --no-browser
pause
