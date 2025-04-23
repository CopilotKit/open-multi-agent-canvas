

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
- **Knowledge Agent**: A specialized agent for visualizing, querying, and managing knowledge graphs.

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

### 3. One-Click Startup (Recommended)

We've created convenient scripts to start both the frontend and backend with a single command:

**Windows (PowerShell - Recommended):**
```
./start-all.ps1
```

**Windows (Batch):**
```
start-all.bat
```

These scripts will:
- Check for required dependencies
- Start the backend with a health endpoint
- Start the frontend
- Verify the integration between frontend and backend

To stop all services:
```
./stop-all.ps1  # or stop-all.bat
```

To check the health of all services:
```
./check-health.ps1  # or check-health.bat
```

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

The MCP Agent allows you to connect to various MCP-compatible servers:

1. **Configuring Custom MCP Servers**:
   - Click the "MCP Servers" button in the top right of the interface
   - Add servers via the configuration panel:
     - **Standard IO**: Run commands locally (e.g., Python scripts)
     - **SSE**: Connect to external MCP-compatible servers (via Server-Sent Events)

2. **Public MCP Servers**:
   - You can connect to public MCP servers like [mcp.composio.dev](https://mcp.composio.dev/) and [mcp.run](https://www.mcp.run/)

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
3. **Automatic Fallback**: If the custom server fails to start, it automatically falls back to a simple health server to maintain basic functionality.

## Running a tunnel

Add another terminal and select Remote Endpoint.
Then select Local Development.
Once this is done, copy the command into your terminal and change the port to match the LangGraph server `8124`
![image](https://github.com/user-attachments/assets/6bf41042-9529-4470-8baf-dd076aad31a1)


## Testing the Backend

A test script is included to verify that the backend is working correctly:

```sh
cd agent
python test_server.py
```

This script tests the health endpoint, routes endpoint, and root endpoint to ensure the server is functioning properly.

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

### Port Conflicts

If you encounter port conflicts when starting the backend server, you may see an error like:

```
ERROR: [Errno 10048] error while attempting to bind on address ('127.0.0.1', 8124): [winerror 10048] only one usage of each socket address is allowed
```

To resolve this:

1. Find the process using the port:
   ```
   netstat -ano | findstr :8124
   ```

2. Terminate the process:
   ```
   taskkill /F /PID <process_id>
   ```

3. Restart the server

### Backend Connection Issues

If the frontend cannot connect to the backend:

1. Verify the backend is running:
   ```
   curl http://localhost:8124/health
   ```

2. Check that the frontend's `.env` file has the correct backend URL:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8124
   ```

3. Run the test script to verify the backend is working correctly:
   ```
   cd agent && python test_server.py
   ```

## Documentation
- [CopilotKit Docs](https://docs.copilotkit.ai/coagents)
- [LangGraph Platform Docs](https://langchain-ai.github.io/langgraph/cloud/deployment/cloud/)
- [Model Context Protocol (MCP) Docs](https://github.com/langchain-ai/langgraph/tree/main/examples/mcp)

## License
Distributed under the MIT License. See LICENSE for more info.
