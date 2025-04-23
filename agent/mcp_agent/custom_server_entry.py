"""
Entry point for the custom server with health endpoint.
This script attempts to start the custom server with LangGraph integration.
If that fails, it falls back to a simple health server.
"""

import sys
import os
import time
import platform
import traceback
import uvicorn
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_custom_server():
    """Run the custom server with health endpoint."""
    try:
        # Get the current directory (mcp_agent)
        current_dir = Path(__file__).parent

        # Get the parent directory (agent)
        agent_dir = current_dir.parent

        # Change to the agent directory
        os.chdir(agent_dir)

        # Log system information
        logger.info(f"Starting MCP Agent server")
        logger.info(f"Python version: {sys.version}")
        logger.info(f"Platform: {platform.platform()}")
        logger.info(f"Working directory: {os.getcwd()}")

        print(f"Starting custom MCP Agent server on http://localhost:8123")
        print(f"Health endpoint available at http://localhost:8123/health")

        # Try to run the custom server
        try:
            logger.info("Attempting to start custom server with LangGraph integration")

            # Check if the custom_server module can be imported
            try:
                from mcp_agent import custom_server
                logger.info("Successfully imported custom_server module")
            except ImportError as ie:
                logger.error(f"Failed to import custom_server module: {ie}")
                raise

            # Start the server with more stable configuration on port 8124
            # Using a different port to avoid conflicts
            port = 8124
            print(f"Starting custom MCP Agent server on http://localhost:{port}")
            print(f"Health endpoint available at http://localhost:{port}/health")
            print(f"LangGraph endpoint available at http://localhost:{port}/v1/graphs/mcp-agent/invoke")
            uvicorn.run(
                "mcp_agent.custom_server:create_app",
                host="localhost",
                port=port,
                factory=True,
                reload=False,  # Disable auto-reload to avoid issues
                log_level="info",
                access_log=True,
                timeout_keep_alive=65  # Increase keep-alive timeout
            )
        except Exception as e:
            logger.error(f"Failed to start custom server: {e}")
            logger.error(f"Exception type: {type(e).__name__}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            logger.info("Falling back to simple health server")
            print(f"\nFalling back to simple health server...")

            # Wait a moment to ensure any port conflicts are resolved
            time.sleep(1)

            # Run the enhanced health server as fallback
            try:
                from mcp_agent.health_server import run_server
                run_server()
            except Exception as health_error:
                logger.critical(f"Failed to start fallback health server: {health_error}")
                logger.critical(f"Traceback: {traceback.format_exc()}")
                print(f"\nCritical error: Failed to start any server")
                sys.exit(1)

    except KeyboardInterrupt:
        print("\nServer stopped by user.")
    except Exception as e:
        logger.critical(f"Unhandled exception: {e}")
        logger.critical(f"Traceback: {traceback.format_exc()}")
        print(f"\nError starting any server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_custom_server()
