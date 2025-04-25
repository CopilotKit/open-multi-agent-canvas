"""
Database service for the MCP Agent.
This module provides functions to interact with the PostgreSQL database.
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection parameters
DB_URL = os.getenv("DIRECT_URL")

def get_connection():
    """Get a database connection."""
    try:
        conn = psycopg2.connect(DB_URL)
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        raise

class DatabaseService:
    """Service for interacting with the database."""

    @staticmethod
    def get_connection():
        """Get a database connection."""
        return get_connection()

    @staticmethod
    def initialize_database():
        """Initialize the database with required tables if they don't exist."""
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Create sessions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Create entities table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS entities (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(255) NOT NULL,
                    properties JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE
                )
            """)

            # Create relations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS relations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    type VARCHAR(255) NOT NULL,
                    properties JSONB DEFAULT '{}',
                    from_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
                    to_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE
                )
            """)

            conn.commit()
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def create_user(email: str, name: Optional[str] = None) -> Dict[str, Any]:
        """Create a new user."""
        try:
            conn = get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute("""
                INSERT INTO users (email, name)
                VALUES (%s, %s)
                RETURNING id, email, name, created_at, updated_at
            """, (email, name))

            user = cursor.fetchone()
            conn.commit()
            return dict(user)
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email."""
        try:
            conn = get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute("""
                SELECT id, email, name, created_at, updated_at
                FROM users
                WHERE email = %s
            """, (email,))

            user = cursor.fetchone()
            return dict(user) if user else None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def create_entity(name: str, entity_type: str, properties: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new entity."""
        try:
            conn = get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute("""
                INSERT INTO entities (name, type, properties, user_id)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, type, properties, created_at, updated_at, user_id
            """, (name, entity_type, json.dumps(properties), user_id))

            entity = cursor.fetchone()
            conn.commit()
            return dict(entity)
        except Exception as e:
            logger.error(f"Error creating entity: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def get_entities_by_user(user_id: str) -> List[Dict[str, Any]]:
        """Get all entities for a user."""
        try:
            conn = get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute("""
                SELECT id, name, type, properties, created_at, updated_at, user_id
                FROM entities
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))

            entities = cursor.fetchall()
            return [dict(entity) for entity in entities]
        except Exception as e:
            logger.error(f"Error getting entities by user: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def create_relation(relation_type: str, from_entity_id: str, to_entity_id: str,
                        properties: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new relation between entities."""
        try:
            conn = get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute("""
                INSERT INTO relations (type, from_entity_id, to_entity_id, properties, user_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, type, from_entity_id, to_entity_id, properties, created_at, updated_at, user_id
            """, (relation_type, from_entity_id, to_entity_id, json.dumps(properties), user_id))

            relation = cursor.fetchone()
            conn.commit()
            return dict(relation)
        except Exception as e:
            logger.error(f"Error creating relation: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def get_relations_by_user(user_id: str) -> List[Dict[str, Any]]:
        """Get all relations for a user."""
        try:
            conn = get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute("""
                SELECT id, type, from_entity_id, to_entity_id, properties, created_at, updated_at, user_id
                FROM relations
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))

            relations = cursor.fetchall()
            return [dict(relation) for relation in relations]
        except Exception as e:
            logger.error(f"Error getting relations by user: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def get_knowledge_graph(user_id: str) -> Dict[str, Any]:
        """Get the complete knowledge graph for a user."""
        try:
            entities = DatabaseService.get_entities_by_user(user_id)
            relations = DatabaseService.get_relations_by_user(user_id)

            return {
                "entities": entities,
                "relations": relations
            }
        except Exception as e:
            logger.error(f"Error getting knowledge graph: {e}")
            raise
