"""
Enhanced health server for the MCP Agent.
This provides a minimal server with health and diagnostic endpoints.
This server is used as a fallback when the custom server fails to start.
"""

import os
import sys
import platform
import logging
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a new FastAPI app
app = FastAPI(
    title="MCP Agent Health Server",
    description="A fallback server with health and diagnostic endpoints",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you should restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "MCP Agent backend is running (fallback health server)"}

@app.get("/")
async def root():
    """Root endpoint with server information."""
    return {
        "name": "MCP Agent Health Server",
        "version": "0.1.0",
        "status": "running",
        "mode": "fallback",
        "endpoints": [
            {"path": "/health", "method": "GET", "description": "Health check endpoint"},
            {"path": "/", "method": "GET", "description": "Root endpoint with server information"},
            {"path": "/system", "method": "GET", "description": "System information endpoint"},
            {"path": "/routes", "method": "GET", "description": "List all available routes"}
        ]
    }

@app.get("/system")
async def system_info():
    """System information endpoint."""
    return {
        "python_version": sys.version,
        "platform": platform.platform(),
        "system": platform.system(),
        "processor": platform.processor(),
        "cwd": os.getcwd(),
        "env_vars": {k: v for k, v in os.environ.items() if k.startswith(('LANGGRAPH_', 'OPENAI_', 'ANTHROPIC_'))}
    }

@app.get("/routes")
async def list_routes():
    """List all available routes."""
    routes = []
    for route in app.routes:
        route_info = {
            "path": route.path,
            "name": route.name,
            "methods": list(route.methods) if hasattr(route, 'methods') else []
        }
        routes.append(route_info)
    return {"routes": routes}

# Add global exception handler
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

def run_server(port=8124):
    """Run the health server."""
    logger.info(f"Starting fallback health server on http://localhost:{port}")
    logger.info("This is a minimal server with only basic endpoints")
    logger.info("The custom server with LangGraph integration could not be started")
    try:
        # Use more stable configuration
        uvicorn.run(
            app,
            host="localhost",
            port=port,
            log_level="info",
            access_log=True,
            timeout_keep_alive=65  # Increase keep-alive timeout
        )
    except Exception as e:
        logger.error(f"Error running fallback health server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_server()
