# KB-multi-agent Project Structure

This document provides a comprehensive overview of the KB-multi-agent project structure, architecture, and components.

## Overview

KB-multi-agent is a sophisticated multi-agent application that combines a Next.js frontend with a LangGraph backend to create a unified interface for interacting with multiple specialized AI agents. The application follows a modular architecture with clear separation of concerns between frontend and backend components.

Open Multi-Agent Canvas, created by [CopilotKit](https://github.com/CopilotKit/CopilotKit), is an open-source multi-agent chat interface that lets you manage multiple agents in one dynamic conversation. It's built to help with travel planning, research, knowledge management, and general-purpose tasks through MCP servers.

## Architecture

The project consists of two main components:

### 1. Frontend (Next.js)

- **Framework**: Next.js 15.3.1 with React 19
- **State Management**: TanStack Query and CopilotKit
- **UI Components**: Component-based architecture for different agent UIs
- **Styling**: Tailwind CSS with shadcn/ui components
- **Communication**: Server-Sent Events (SSE) for real-time updates

### 2. Backend (LangGraph)

- **Framework**: LangGraph for agent workflows
- **Server**: FastAPI for HTTP endpoints
- **Architecture**: Modular with configurable components
- **Integration**: Custom server with health and diagnostic endpoints
- **Tools**: MultiServerMCPClient for external service integration
- **Database**: PostgreSQL or Supabase for persistent storage

## Directory Structure

```
KB-multi-agent/
├── agent/                      # Backend code
│   ├── mcp_agent/              # Main agent code
│   │   ├── integrations/       # Modular backend integrations
│   │   ├── agent.py            # Main agent workflow definition
│   │   ├── agent_factory.py    # Factory for creating agents
│   │   ├── custom_server.py    # Custom FastAPI server
│   │   ├── langgraph.json      # LangGraph configuration
│   │   └── run_server.py       # Server startup script
│   ├── knowledge_server.py     # Knowledge graph server
│   └── math_server.py          # Math operations server
│
├── frontend/                   # Frontend code
│   ├── src/
│   │   ├── app/                # Next.js pages and layouts
│   │   ├── components/         # React components
│   │   │   ├── agents/         # Agent-specific UI components
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── enhanced-*.tsx  # Layout and sidebar components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions and types
│   │   └── providers/          # Global state providers
│   ├── public/                 # Static assets
│   └── next.config.ts          # Next.js configuration
│
├── scripts/                    # Scripts for starting, stopping, and managing the application
│   ├── check-app-health.ps1    # Health check script
│   ├── init-database.ps1       # Database initialization script
│   ├── init-supabase.ps1       # Supabase initialization script
│   ├── install-db-deps.ps1     # Database dependencies installation script
│   ├── start-app.ps1           # Application startup script
│   └── stop-app.ps1            # Application shutdown script
│
├── start-app.ps1               # Root shortcut to start the application
└── README.md                   # Project documentation
```

## Components

### Frontend Components

#### Agent Components

The frontend includes specialized UI components for each agent type:

1. **Travel Agent** (`frontend/src/components/agents/travel-agent.tsx`)
   - Plans trips and creates itineraries
   - Displays locations on an interactive map
   - Uses Leaflet for map visualization

2. **Research Agent** (`frontend/src/components/agents/researcher.tsx`)
   - Conducts research with real-time progress updates
   - Provides structured research reports
   - Shows resource links and citations

3. **MCP Agent** (`frontend/src/components/agents/mcp-agent.tsx`)
   - General-purpose agent using MCP servers
   - Connects to configurable backend services
   - Displays real-time logs and responses

4. **Knowledge Agent** (`frontend/src/components/agents/knowledge-agent.tsx`)
   - Visualizes and queries knowledge graphs
   - Displays entity relationships
   - Interactive graph visualization
   - Persistent storage with PostgreSQL or Supabase

#### Core Components

- **Canvas** (`frontend/src/components/canvas.tsx`): Main container for agent UIs
- **Enhanced Sidebar** (`frontend/src/components/enhanced-sidebar.tsx`): Navigation sidebar
- **Enhanced Layout** (`frontend/src/components/enhanced-layout.tsx`): Main layout component
- **Map Container** (`frontend/src/components/map-container.tsx`): Interactive map for Travel Agent
- **Knowledge Graph** (`frontend/src/components/knowledge-graph.tsx`): Graph visualization
- **Knowledge Graph Visualization** (`frontend/src/components/knowledge-graph-visualization.tsx`): Interactive visualization

#### State Management

- **CoAgents Provider** (`frontend/src/components/coagents-provider.tsx`): Manages agent state
- **Settings Provider** (`frontend/src/providers/SettingsProvider.tsx`): Manages application settings
- **Providers** (`frontend/src/providers/Providers.tsx`): Root providers for the application

### Backend Components

#### Core Components

1. **Agent Factory** (`agent/mcp_agent/agent_factory.py`)
   - Creates agents with modular, configurable backends
   - Supports different memory, LLM, and knowledge backends
   - Configurable through environment variables

2. **Agent Workflow** (`agent/mcp_agent/agent.py`)
   - Defines the LangGraph workflow
   - Implements the chat node for processing messages
   - Integrates with tools and services

3. **Custom Server** (`agent/mcp_agent/custom_server.py`)
   - FastAPI server with health endpoint
   - LangGraph integration for agent workflows
   - CORS middleware for frontend communication

4. **Knowledge Server** (`agent/knowledge_server.py`)
   - Manages knowledge graph data
   - Provides API endpoints for querying and updating the knowledge graph
   - Integrates with PostgreSQL or Supabase for persistent storage

#### Integrations

The backend includes modular integrations for various services:

- **Memory Management**:
  - `mem0`: Integration with mem0.ai for persistent memory
  - `memorysaver`: In-memory storage using LangGraph's MemorySaver

- **LLM Integration**:
  - `litellm`: Unified interface for various LLM providers

- **Agent-to-Agent Communication**:
  - `inmemory`: In-process communication between agents

- **Knowledge Graph**:
  - `graphiti`: Integration with knowledge graph services
  - `postgres`: PostgreSQL database integration
  - `supabase`: Supabase database integration

- **Logging and Tracing**:
  - `logfire`: Integration for logging, tracing, and monitoring

## Communication Flow

### Frontend to Backend

1. The frontend communicates with the backend through Server-Sent Events (SSE)
2. The MCP Agent component performs health checks to verify the backend is running
3. MCP configurations are stored in localStorage and passed to the backend
4. API requests are sent to the `/v1/graphs/mcp-agent/invoke` endpoint

### Backend Processing

1. The backend receives requests through the FastAPI server
2. LangGraph processes the request through the defined workflow
3. The agent uses tools like the MultiServerMCPClient to interact with external services
4. Results are streamed back to the frontend through SSE

## Server Implementation

The backend includes two server implementations:

1. **Custom Server** (Recommended):
   - Enhanced FastAPI server with health endpoint
   - Improved error handling and diagnostics
   - Automatic fallback to simple health server

2. **Standard LangGraph Server**:
   - Default LangGraph development server
   - Provides graph visualization and debugging tools

## Database Integration

The Knowledge Agent includes database integration for persistent storage of knowledge graph data. You can choose between PostgreSQL or Supabase as your database backend.

### PostgreSQL Integration

PostgreSQL is the default database backend and provides:
- Persistent storage for knowledge graph entities and relations
- Efficient querying of graph data
- Support for complex relationships and properties

The PostgreSQL connection is configured in the `agent/.env` file with the following variables:
```
DATABASE_BACKEND=postgres
DATABASE_URL='prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY'
DIRECT_URL='postgres://username:password@hostname/database?sslmode=require'
```

### Supabase Integration

Supabase provides an alternative database backend with:
- User authentication and authorization
- Real-time updates
- REST API for database access

The Supabase connection is configured in both `frontend/.env` and `agent/.env`:

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

## Startup Process

The application is started using the `start-app.ps1` script in the root directory, which calls the corresponding script in the scripts folder. This script:

1. Checks for required dependencies (Poetry, PNPM)
2. Starts the backend with a health endpoint on port 8124
3. Starts the frontend on port 3000
4. Verifies the integration between frontend and backend
5. Displays URLs for accessing the application

## Configuration

The application is configured through:

1. **Environment Variables**:
   - `NEXT_PUBLIC_BACKEND_URL`: Backend URL for frontend
   - `NEXT_PUBLIC_COPILOT_CLOUD_API_KEY`: API key for CopilotKit
   - `OPENAI_API_KEY`: API key for OpenAI (backend)
   - `DATABASE_BACKEND`: Database backend to use (postgres or supabase)

2. **Local Storage**:
   - MCP server configurations
   - User preferences and settings

3. **LangGraph Configuration**:
   - `langgraph.json`: Defines the agent workflows

## Development Workflow

For development:

1. Start the backend:
   ```bash
   cd agent
   poetry install
   poetry run custom-server
   ```

2. Start the frontend:
   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```

3. Access the frontend at http://localhost:3000
4. Verify backend health at http://localhost:8124/health

## Scripts

The project includes several scripts in the `scripts` directory for managing the application:

1. **check-app-health.ps1**: Checks the health of the frontend and backend
2. **init-database.ps1**: Initializes the PostgreSQL database
3. **init-supabase.ps1**: Initializes the Supabase database
4. **install-db-deps.ps1**: Installs PostgreSQL database dependencies
5. **install-supabase-deps.ps1**: Installs Supabase dependencies
6. **start-app.ps1**: Starts the frontend and backend
7. **stop-app.ps1**: Stops the frontend and backend

These scripts are available in both PowerShell (.ps1) and Batch (.bat) formats for Windows users.

## Testing

The application includes tests for both frontend and backend components:

- **Backend Tests**: Unit tests for agent factory, integrations, and workflows
- **Frontend Tests**: Component tests using React Testing Library

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

## Conclusion

The KB-multi-agent project demonstrates a sophisticated architecture for building multi-agent applications with a clear separation between frontend and backend components. The modular design allows for easy extension and customization, making it a flexible platform for various AI agent use cases.

Key features include:
- Multiple specialized AI agents (Travel, Research, MCP, Knowledge)
- Modular architecture with configurable components
- Real-time communication through Server-Sent Events
- Persistent storage with PostgreSQL or Supabase
- Interactive visualizations for knowledge graphs and maps
- Comprehensive scripts for managing the application
