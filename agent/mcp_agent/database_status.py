"""
Database status module for the MCP Agent.
This provides endpoints for checking the database status.
"""

import os
import sys
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a router
router = APIRouter()

@router.get("/database/status")
async def database_status():
    """Database status endpoint."""
    try:
        # Check database configuration
        database_backend = os.environ.get("DATABASE_BACKEND", "supabase")
        
        if database_backend == "supabase":
            # Check Supabase configuration
            supabase_url = os.environ.get("SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
            
            if not supabase_url or not supabase_key:
                return {
                    "status": "warning",
                    "message": "Supabase configuration incomplete",
                    "type": "Supabase",
                    "tables": 0,
                    "connected": False
                }
            
            # Try to import supabase-py
            try:
                from supabase import create_client
                
                # Try to connect to Supabase
                supabase = create_client(supabase_url, supabase_key)
                
                # Try to get table information
                try:
                    # This is a simple query to check if we can connect
                    response = supabase.table("entities").select("count", count="exact").execute()
                    count = response.count if hasattr(response, "count") else 0
                    
                    return {
                        "status": "ok",
                        "message": "Connected to Supabase",
                        "type": "Supabase",
                        "tables": 4,  # Hardcoded for now
                        "connected": True,
                        "entities": count
                    }
                except Exception as e:
                    logger.warning(f"Could not query Supabase: {e}")
                    return {
                        "status": "warning",
                        "message": f"Connected to Supabase but could not query tables: {str(e)}",
                        "type": "Supabase",
                        "tables": 4,  # Hardcoded for now
                        "connected": True
                    }
            except ImportError:
                logger.warning("supabase-py not installed")
                return {
                    "status": "warning",
                    "message": "supabase-py not installed",
                    "type": "Supabase",
                    "tables": 4,  # Hardcoded for now
                    "connected": False
                }
        elif database_backend == "postgres":
            # Check PostgreSQL configuration
            database_url = os.environ.get("DATABASE_URL")
            
            if not database_url:
                return {
                    "status": "warning",
                    "message": "PostgreSQL configuration incomplete",
                    "type": "PostgreSQL",
                    "tables": 0,
                    "connected": False
                }
            
            # Try to import psycopg2
            try:
                import psycopg2
                
                # Try to connect to PostgreSQL
                try:
                    conn = psycopg2.connect(database_url)
                    cursor = conn.cursor()
                    
                    # Get table count
                    cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
                    table_count = cursor.fetchone()[0]
                    
                    # Get entity count
                    try:
                        cursor.execute("SELECT COUNT(*) FROM entities")
                        entity_count = cursor.fetchone()[0]
                    except:
                        entity_count = 0
                    
                    conn.close()
                    
                    return {
                        "status": "ok",
                        "message": "Connected to PostgreSQL",
                        "type": "PostgreSQL",
                        "tables": table_count,
                        "connected": True,
                        "entities": entity_count
                    }
                except Exception as e:
                    logger.warning(f"Could not connect to PostgreSQL: {e}")
                    return {
                        "status": "error",
                        "message": f"Could not connect to PostgreSQL: {str(e)}",
                        "type": "PostgreSQL",
                        "tables": 0,
                        "connected": False
                    }
            except ImportError:
                logger.warning("psycopg2 not installed")
                return {
                    "status": "warning",
                    "message": "psycopg2 not installed",
                    "type": "PostgreSQL",
                    "tables": 0,
                    "connected": False
                }
        else:
            return {
                "status": "warning",
                "message": f"Unknown database backend: {database_backend}",
                "type": "Unknown",
                "tables": 0,
                "connected": False
            }
    except Exception as e:
        logger.error(f"Error checking database status: {e}")
        return {
            "status": "error",
            "message": f"Error checking database status: {str(e)}",
            "type": "Unknown",
            "tables": 0,
            "connected": False
        }
