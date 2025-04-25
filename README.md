

<div align="center">

# Open Multi-Agent Canvas

![CopilotKit-Banner](https://github.com/user-attachments/assets/8167c845-0381-45d9-ad1c-83f995d48290)
</div>


![multi-agent-canvas](https://github.com/user-attachments/assets/5953a5a6-5686-4722-9477-5279b67b3dba)


Open Multi-Agent Canvas, created by [CopilotKit](https://github.com/CopilotKit/CopilotKit) is an open-source multi-agent chat interface that lets you manage multiple agents in one dynamic conversation. It's built with Next.js, LangGraph, and CopilotKit to help with travel planning, research, and general-purpose tasks through MCP servers.

## Existing Agents

Check out these awesome agents (they live in separate repositories). You can run them separately or deploy them on LangSmith:
- [CoAgents Travel Agent](https://github.com/CopilotKit/CopilotKit/tree/main/examples/coagents-travel/agent)
- [CoAgents AI Researcher](https://github.com/CopilotKit/CopilotKit/tree/main/examples/coagents-ai-researcher/agent)

Additionally, this project now includes built-in agents:
- **MCP Agent**: A general-purpose agent capable of handling various tasks through configurable MCP servers.
- **Knowledge Agent**: A specialized agent for visualizing, querying, and managing knowledge graphs with PostgreSQL database integration.

## Copilot Cloud is required to run this project

You'll need a Copilot Cloud API key to run the frontend. Get one at [cloud.copilotkit.ai](https://cloud.copilotkit.ai/).

## Architecture Overview

The Multi-Agent Canvas consists of two main components:

1. **Frontend (Next.js)**:
   - Provides the user interface for interacting with agents
   - Manages agent state using CopilotKit
   - Communicates with the backend via Server-Sent Events (SSE)

2. **Backend (LangGraph)**:
   - Runs the agent workflows using LangGraph
   - Provides API endpoints for the frontend
   - Integrates with various tools and services
   - Includes a custom server with health and diagnostic endpoints

### Server Implementation

The backend includes two server implementations:

1. **Custom Server** (Recommended):
   - Enhanced FastAPI server with health endpoint
   - Improved error handling and diagnostics
   - Automatic fallback to simple health server

2. **Standard LangGraph Server**:
   - Default LangGraph development server
   - Provides graph visualization and debugging tools

The start-all.ps1 script attempts to start the custom server first, and if that fails, it falls back to the standard server.


## Quick Start 🚀

### 1. Prerequisites
Make sure you have:
- [pnpm](https://pnpm.io/installation) for frontend dependencies
- [Poetry](https://python-poetry.org/docs/#installation) for backend dependencies
- [Python](https://www.python.org/downloads/) (v3.10 or later)
- [Node.js](https://nodejs.org/) (v18 or later)

### 2. API Keys
- [Copilot Cloud](https://cloud.copilotkit.ai) for the frontend
- OpenAI API key for the backend (optional)

### 3. Starting the Application

We've simplified the application management to a single script that handles all operations:

```powershell
# Start the application (standard mode)
./start-app.ps1

# Start with interactive mode (includes Supabase)
./start-app.ps1 -Interactive

# Force restart (when console windows aren't visible)
./start-app.ps1 -Force

# Stop all components
./start-app.ps1 -Action stop

# Restart specific component
./start-app.ps1 -Action restart -Component backend

# Check status
./start-app.ps1 -Action status -Detailed
```

This unified script will:
- Check for required dependencies
- Start the backend with a health endpoint
- Start the frontend
- Initialize the database (PostgreSQL or Supabase)
- Verify the integration between all components

**Parameters:**
- `-Action`: start, stop, restart, or status (default: start)
- `-Component`: all, backend, frontend, or database (default: all)
- `-Interactive`: Enable interactive mode with Supabase
- `-Force`: Force restart, creating new console windows
- `-Detailed`: Show detailed status information

Examples:
```powershell
# Basic operations
./start-app.ps1                                  # Start everything
./start-app.ps1 -Interactive                     # Start with Supabase integration
./start-app.ps1 -Action stop                     # Stop all components

# Force restart (creates new console windows)
./start-app.ps1 -Force                           # Force restart all components
./start-app.ps1 -Component backend -Force        # Force restart just the backend

# Component-specific operations
./start-app.ps1 -Component backend               # Start just the backend
./start-app.ps1 -Component frontend              # Start just the frontend
./start-app.ps1 -Component database              # Initialize the database
./start-app.ps1 -Action restart -Component backend # Restart the backend

# Status and maintenance
./start-app.ps1 -Action status -Detailed         # Detailed status check
```

### Database Integration

The Knowledge Agent now includes database integration for persistent storage of knowledge graph data. You can choose between PostgreSQL or Supabase as your database backend.

#### Option 1: PostgreSQL (Default)

To set up PostgreSQL:

1. Install the required dependencies:
```
./scripts/install-db-deps.ps1  # or ./scripts/install-db-deps.bat
```

2. Initialize the database:
```
./scripts/manage-app.ps1 -Action start -Component database
```

The PostgreSQL connection is configured in the `agent/.env` file with the following variables:
```
DATABASE_BACKEND=postgres
DATABASE_URL='prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY'
DIRECT_URL='postgres://username:password@hostname/database?sslmode=require'
```

#### Option 2: Supabase

To set up Supabase:

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Install the required dependencies:
```
./scripts/install-supabase-deps.ps1  # or ./scripts/install-supabase-deps.bat
```

3. Configure your environment variables in both `frontend/.env` and `agent/.env`:

   Frontend `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   Backend `.env`:
   ```
   DATABASE_BACKEND=supabase
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   ```

4. Initialize Supabase tables and default user (either method works):
```
./scripts/init-supabase.ps1                                      # Manual initialization
./scripts/manage-app.ps1 -Action start -Component supabase       # Using the management script
./start-app-interactive.ps1                                      # Using the interactive startup script
```

5. Run the SQL script in `scripts/update-supabase-tables.sql` in the Supabase SQL Editor to ensure all tables are properly configured.

The initialization script will:
- Check if all required tables exist with the correct structure
- Create a default user for testing
- Provide instructions for any missing tables or columns

For more detailed instructions, see [STARTUP.md](./STARTUP.md).

### 4. Manual Setup

#### Running the Frontend

Rename the `example.env` file in the `frontend` folder to `.env`:

```sh
NEXT_PUBLIC_COPILOT_CLOUD_API_KEY=...
NEXT_PUBLIC_BACKEND_URL=http://localhost:8124
```

Install dependencies:

```sh
cd frontend
pnpm i
```

Need a CopilotKit API key? Get one [here](https://cloud.copilotkit.ai/).

Then, fire up the Next.js project:

```sh
pnpm run dev  # for development
# or
pnpm run build && pnpm run start  # for production
```

## Agent Features

### MCP Agent

![mcp-demo](./agent/demo/mcp-demo.gif)

The MCP Agent allows you to connect to various MCP-compatible servers and select different agent frameworks:

1. **Configuring Custom MCP Servers**:
   - Click the "MCP Servers" button in the top right of the interface
   - Add servers via the configuration panel:
     - **Standard IO**: Run commands locally (e.g., Python scripts)
     - **SSE**: Connect to external MCP-compatible servers (via Server-Sent Events)

2. **Public MCP Servers**:
   - You can connect to public MCP servers like [mcp.composio.dev](https://mcp.composio.dev/) and [mcp.run](https://www.mcp.run/)

3. **Framework Selection**:
   - Click the settings icon in the MCP Agent interface
   - Select from available frameworks:
     - **LangGraph**: Default framework using LangGraph for agent workflows
     - **OpenAI Agents**: Alternative framework using OpenAI Agents SDK
     - **Hybrid**: Uses OpenAI Agents first, falls back to LangGraph if there's an error

### Knowledge Agent

The Knowledge Agent provides a powerful interface for working with knowledge graphs:

1. **Interactive Graph Visualization**:
   - Visualize entities and relationships in an interactive force-directed graph
   - Zoom, pan, and explore the knowledge structure visually
   - Filter by entity types and relationship types

2. **Entity Management**:
   - Add new entities to the knowledge graph
   - Edit existing entities and their properties
   - View detailed information about entities

3. **Knowledge Querying**:
   - Search for entities and concepts in the knowledge graph
   - Find relationships between entities
   - Explore the knowledge structure through natural language queries

#### Running the MCP Agent Backend

Rename the `example.env` file in the `agent` folder to `.env`:

```sh
OPENAI_API_KEY=...
LANGSMITH_API_KEY=...

# Framework Configuration
# Options: langgraph, openai_agents, hybrid
FRAMEWORK=langgraph
DEFAULT_MODEL=gpt-4o

# Optional Logfire configuration
LOGFIRE_PROJECT=kb-multi-agent
LOGFIRE_TOKEN=...
LOGGING_ENABLED=true
```

If you want to use the included MCP Agent with the built-in math and knowledge servers:

```sh
cd agent
poetry install

# Standard server (no health endpoint)
poetry run demo

# OR use the improved server with health endpoint (recommended)
poetry run custom-server
```

The custom server provides a health endpoint at http://localhost:8124/health that the frontend can use to verify the backend is running. It also includes additional diagnostic endpoints like `/routes` and a root endpoint with server information.

### Enhanced Server Features

1. **Robust Error Handling**: The custom server includes comprehensive error handling and fallback mechanisms to ensure reliability.
2. **Diagnostic Endpoints**:
   - `/health`: Check if the server is running
   - `/routes`: List all available API routes
   - `/`: Root endpoint with server information
   - `/config/mode`: Set the framework mode (langgraph, openai_agents, hybrid)
3. **Automatic Fallback**: If the custom server fails to start, it automatically falls back to a simple health server to maintain basic functionality.
4. **Framework Selection**: The server supports multiple agent frameworks:
   - **LangGraph**: Default framework using LangGraph for agent workflows
   - **OpenAI Agents**: Alternative framework using OpenAI Agents SDK
   - **Hybrid**: Uses OpenAI Agents first, falls back to LangGraph if there's an error

## Running a tunnel

Add another terminal and select Remote Endpoint.
Then select Local Development.
Once this is done, copy the command into your terminal and change the port to match the LangGraph server `8124`
![image](https://github.com/user-attachments/assets/6bf41042-9529-4470-8baf-dd076aad31a1)


## Testing the Backend

Test scripts are included to verify that the backend is working correctly:

```sh
# Test basic server functionality
cd agent
python test_server.py

# Test framework integration
python test_framework_integration.py

# Test with a specific framework
python test_server.py --framework openai_agents
```

You can also use the PowerShell script to test the framework integration:

```sh
./scripts/test-framework.ps1
```

These scripts test the health endpoint, routes endpoint, root endpoint, and framework selection to ensure the server is functioning properly.

## Backend Integrations

The backend includes several modular integrations that can be configured via environment variables:

1. **Memory Management**:
   - `mem0`: Integration with [mem0](https://mem0.ai/) for persistent memory storage
   - `memorysaver`: Default in-memory storage using LangGraph's MemorySaver

2. **LLM Integration**:
   - `litellm`: Unified interface for various LLM providers through [LiteLLM](https://github.com/BerriAI/litellm)

3. **Agent-to-Agent Communication**:
   - `inmemory`: In-process communication between agents

4. **Knowledge Graph**:
   - `graphiti`: Integration with knowledge graph services

5. **Logging and Tracing**:
   - `logfire`: Integration with [Logfire](https://logfire.ai/) for logging, tracing, and monitoring
   - See [Logfire Integration](./agent/LOGFIRE.md) for detailed setup instructions

## Troubleshooting

### Quick Fix Scripts

We've created several scripts to help diagnose and fix common issues:

1. **Simple Start Script**:

   ```powershell
   ./scripts/simple-start.ps1
   ```

   This script starts both the backend and frontend in minimal mode, bypassing any complex initialization.

2. **Backend Diagnostic Script**:

   ```powershell
   ./scripts/diagnose-backend.ps1
   ```

   Checks for common backend issues and provides detailed diagnostics.

3. **Frontend Fix Script**:

   ```powershell
   ./scripts/fix-frontend.ps1
   ```

   Clears Next.js cache and rebuilds the frontend to fix chunk loading errors.

### Port Conflicts

If you encounter port conflicts when starting the backend server, you may see an error like:

```bash
ERROR: [Errno 10048] error while attempting to bind on address ('127.0.0.1', 8124): [winerror 10048] only one usage of each socket address is allowed
```

To resolve this:

1. Find the process using the port:

   ```powershell
   netstat -ano | findstr :8124
   ```

2. Terminate the process:

   ```powershell
   taskkill /F /PID <process_id>
   ```

3. Alternatively, use our fix script:

   ```powershell
   ./scripts/fix-backend-offline.ps1
   ```

### Backend Connection Issues

If the frontend cannot connect to the backend:

1. Verify the backend is running:

   ```bash
   curl http://localhost:8124/health
   ```

2. Check that the frontend's `.env` file has the correct backend URL:

   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8124
   ```

3. Run the test script to verify the backend is working correctly:

   ```bash
   cd agent && python test_server.py
   ```

4. If the backend still won't start, try running the health server directly:

   ```bash
   cd agent && poetry run python -m mcp_agent.health_server
   ```

### Frontend Issues

#### Chunk Loading Errors

If you encounter chunk loading errors in the frontend, you may see errors like:

```javascript
ChunkLoadError: Loading chunk [...] failed
```

To fix this:

1. Clear the Next.js cache:

   ```bash
   cd frontend
   rm -rf .next
   rm -rf node_modules/.cache
   ```

2. Rebuild the application:

   ```bash
   pnpm install
   pnpm run build
   pnpm run dev
   ```

3. Alternatively, use our fix script:

   ```powershell
   ./scripts/fix-frontend.ps1
   ```

#### Next.js Server Component Errors

If you see errors related to Server Components, such as:

```javascript
Error: `ssr: false` is not allowed with `next/dynamic` in Server Components
```

This is because Next.js App Router uses Server Components by default. To fix:

1. Move dynamic imports with `ssr: false` to Client Components
2. Add the "use client" directive to components that use browser-specific features
3. Create client component wrappers for components that need to be used in Server Components

### Offline Mode

The application is designed to work in offline mode when Supabase or other external services are not available:

1. The backend will run in fallback mode with limited functionality
2. The frontend will use localStorage for temporary storage
3. Basic chat and agent functionality will still work

To start in offline mode:

```powershell
./scripts/simple-start.ps1
```

## Documentation

- [CopilotKit Docs](https://docs.copilotkit.ai/coagents)
- [LangGraph Platform Docs](https://langchain-ai.github.io/langgraph/cloud/deployment/cloud/)
- [Model Context Protocol (MCP) Docs](https://github.com/langchain-ai/langgraph/tree/main/examples/mcp)

## License

Distributed under the MIT License. See LICENSE for more info.
