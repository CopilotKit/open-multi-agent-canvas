"""
Custom server script for the MCP Agent.
This creates a standalone FastAPI server with health endpoint and LangGraph integration.
"""

import os
import sys
import logging
import importlib
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define models for API requests and responses
class GraphRequest(BaseModel):
    inputs: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None

class GraphResponse(BaseModel):
    outputs: Dict[str, Any]

# Create a new FastAPI app
app = FastAPI(
    title="MCP Agent Server",
    description="Custom server with LangGraph integration and health endpoint",
    version="0.1.0"
)


def create_app():
    """Create a FastAPI app with LangGraph integration and health endpoint."""
    # Get the current directory (mcp_agent)
    current_dir = Path(__file__).parent

    # Get the parent directory (agent)
    agent_dir = current_dir.parent

    # Change to the agent directory
    os.chdir(agent_dir)

    # Log the app creation
    logger.info(f"Created FastAPI app for MCP Agent server")

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, you should restrict this
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add a health endpoint
    @app.get("/health")
    async def health_check():
        return {"status": "ok", "message": "MCP Agent backend is running"}

    # Add an endpoint to list all available routes (useful for debugging)
    @app.get("/routes")
    async def list_routes():
        routes = []
        for route in app.routes:
            route_info = {
                "path": route.path,
                "name": route.name,
                "methods": list(route.methods) if hasattr(route, 'methods') else []
            }
            routes.append(route_info)
        return {"routes": routes}

    # Add a root endpoint
    @app.get("/")
    async def root():
        return {
            "name": "MCP Agent Server",
            "version": "0.1.0",
            "status": "running",
            "endpoints": [
                {"path": "/health", "method": "GET", "description": "Health check endpoint"},
                {"path": "/routes", "method": "GET", "description": "List all available routes"},
                {"path": "/", "method": "GET", "description": "Root endpoint with server information"}
            ]
        }

    # Add LangGraph integration endpoints
    try:
        from mcp_agent.agent import graph

        @app.post("/v1/graphs/mcp-agent/invoke")
        async def invoke_graph(request: GraphRequest):
            try:
                # Run the graph with the provided inputs
                result = await graph.ainvoke(request.inputs, request.config)
                return GraphResponse(outputs=result)
            except Exception as e:
                logger.error(f"Error invoking graph: {e}")
                raise HTTPException(status_code=500, detail=str(e))
    except ImportError as e:
        logger.warning(f"Could not import graph from mcp_agent.agent: {e}")
        logger.warning("LangGraph integration endpoints will not be available")

    # Add global exception handler to provide better error messages
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Global exception handler caught: {exc}")
        return JSONResponse(
            status_code=500,
            content={
                "error": str(exc),
                "type": str(type(exc).__name__),
                "path": request.url.path
            }
        )

    # Log all available routes
    logger.info(f"Available routes:")
    for route in app.routes:
        logger.info(f"  {route.path} [{','.join(route.methods) if hasattr(route, 'methods') else 'N/A'}]")

    return app
