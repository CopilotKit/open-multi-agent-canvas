"""
Run server script for the MCP Agent.
This script properly sets up the Python module structure for running the langgraph server.
"""

import os
import sys
import argparse
import subprocess
import uvicorn
from pathlib import Path

def main():
    """Run the langgraph server with the correct module structure."""
    parser = argparse.ArgumentParser(description="Run the MCP Agent server")
    parser.add_argument("--host", default="localhost", help="Host to run the server on")
    parser.add_argument("--port", default="8123", help="Port to run the server on")
    parser.add_argument("--custom", action="store_true", help="Use custom server with health endpoint")
    args = parser.parse_args()

    # Get the current directory (mcp_agent)
    current_dir = Path(__file__).parent

    # Get the parent directory (agent)
    agent_dir = current_dir.parent

    # Change to the agent directory
    os.chdir(agent_dir)

    if args.custom:
        # Run the custom server with health endpoint
        try:
            print(f"Starting custom MCP Agent server on http://{args.host}:{args.port}")
            print(f"Health endpoint available at http://{args.host}:{args.port}/health")
            uvicorn.run(
                "mcp_agent.custom_server:create_app",
                host=args.host,
                port=int(args.port),
                factory=True,
                reload=True
            )
        except KeyboardInterrupt:
            print("\nServer stopped by user.")
    else:
        # Run the standard langgraph dev command
        cmd = [
            "langgraph", "dev",
            "--config", "langgraph.json",
            "--host", args.host,
            "--port", args.port,
            "--no-browser"
        ]

        try:
            # Use subprocess.run with proper error handling
            subprocess.run(cmd, check=True)
        except KeyboardInterrupt:
            print("\nServer stopped by user.")
        except subprocess.CalledProcessError as e:
            print(f"\nError running langgraph server: {e}")
        except Exception as e:
            print(f"\nUnexpected error: {e}")

if __name__ == "__main__":
    main()
