"""
Database initialization script.
Run this script to initialize the database with the required tables.
"""

import logging
from mcp_agent.database.service import DatabaseService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Initialize the database."""
    try:
        logger.info("Initializing database...")
        DatabaseService.initialize_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    main()
