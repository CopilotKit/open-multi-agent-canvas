# Multi-Agent Canvas Startup Guide

This document provides instructions for starting and stopping the Multi-Agent Canvas application, which consists of a frontend (Next.js) and a backend (MCP Agent).

## Prerequisites

Before starting the application, ensure you have the following installed:

- [Poetry](https://python-poetry.org/docs/#installation) for Python dependency management
- [PNPM](https://pnpm.io/installation) for Node.js dependency management
- [Node.js](https://nodejs.org/) (v18 or later)
- [Python](https://www.python.org/downloads/) (v3.10 or later)

## Starting the Application

You have two options for starting the application:

### Option 1: Using the Batch Script (Windows)

1. Double-click the `start-all.bat` file
2. Two command windows will open - one for the backend and one for the frontend
3. Wait for both services to initialize

### Option 2: Using the PowerShell Script (Recommended)

1. Right-click on `start-all.ps1` and select "Run with PowerShell"
2. The script will:
   - Check if all prerequisites are installed
   - Start the backend and verify it's running
   - Start the frontend and verify it's running
   - Verify the integration between frontend and backend
   - Display the URLs for accessing the application

## Accessing the Application

Once both services are running, you can access:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8123](http://localhost:8123)
- Backend Health: [http://localhost:8123/health](http://localhost:8123/health)
- API Documentation: [http://localhost:8123/docs](http://localhost:8123/docs)

## Stopping the Application

You have two options for stopping the application:

### Option 1: Using the Batch Script (Windows)

1. Double-click the `stop-all.bat` file
2. The script will terminate all related processes

### Option 2: Using the PowerShell Script (Recommended)

1. Right-click on `stop-all.ps1` and select "Run with PowerShell"
2. The script will:
   - Identify and stop all frontend processes
   - Identify and stop all backend processes
   - Close any remaining terminal windows

## Troubleshooting

If you encounter issues:

1. **Backend fails to start**:
   - Check if port 8123 is already in use
   - Verify that Poetry is installed correctly
   - Check the backend terminal for specific error messages

2. **Frontend fails to start**:
   - Check if port 3000 is already in use
   - Verify that PNPM is installed correctly
   - Check the frontend terminal for specific error messages

3. **Connection issues**:
   - Verify that both services are running
   - Check that the frontend's `.env` file contains `NEXT_PUBLIC_BACKEND_URL=http://localhost:8123`
   - Try accessing the backend health endpoint directly: [http://localhost:8123/health](http://localhost:8123/health)

## Manual Startup (If Scripts Fail)

If the scripts don't work for any reason, you can start the services manually:

### Backend (MCP Agent)

```bash
cd agent
poetry install
poetry run custom-server
```

### Frontend (Next.js)

```bash
cd frontend
pnpm install
pnpm run dev
```
