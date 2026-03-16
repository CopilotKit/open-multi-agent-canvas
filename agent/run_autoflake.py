"""
Run autoflake on the entire backend codebase to remove unused imports and variables.
"""

import os
import subprocess
from pathlib import Path

def main():
    # Get the current directory (agent)
    agent_dir = Path(__file__).parent
    
    # Get the mcp_agent directory
    mcp_agent_dir = agent_dir / "mcp_agent"
    
    # Run autoflake on the mcp_agent directory
    cmd = [
        "poetry", "run", "autoflake",
        "--remove-all-unused-imports",
        "--remove-unused-variables",
        "--recursive",
        "--in-place",
        str(mcp_agent_dir)
    ]
    
    print("Running autoflake on the backend code...")
    subprocess.run(cmd, cwd=agent_dir)
    print("Autoflake completed.")

if __name__ == "__main__":
    main()
