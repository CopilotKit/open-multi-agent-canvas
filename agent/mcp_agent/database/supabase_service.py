"""
Supabase service for the MCP Agent.
This module provides functions to interact with the Supabase database.
"""

import os
import json
import logging
import uuid
import requests
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase connection parameters
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

class SupabaseService:
    """Service for interacting with the Supabase database."""
    
    @staticmethod
    def _get_headers():
        """Get the headers for Supabase API requests."""
        return {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    
    @staticmethod
    def initialize_database():
        """Initialize the database with required tables if they don't exist.
        
        Note: This is a no-op for Supabase as tables should be created through the Supabase dashboard
        or migrations. This method is kept for compatibility with the previous implementation.
        """
        logger.info("Supabase database initialization is handled through migrations or the dashboard")
        return True
    
    @staticmethod
    def create_user(email: str, name: Optional[str] = None) -> Dict[str, Any]:
        """Create a new user."""
        try:
            user_id = str(uuid.uuid4())
            data = {
                "id": user_id,
                "email": email,
                "name": name
            }
            
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/users",
                headers=SupabaseService._get_headers(),
                json=data
            )
            
            response.raise_for_status()
            return response.json()[0]
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email."""
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/users",
                headers=SupabaseService._get_headers(),
                params={"email": f"eq.{email}"}
            )
            
            response.raise_for_status()
            users = response.json()
            
            if users and len(users) > 0:
                return users[0]
            return None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            raise
    
    @staticmethod
    def create_entity(name: str, entity_type: str, properties: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new entity."""
        try:
            data = {
                "name": name,
                "type": entity_type,
                "properties": properties,
                "user_id": user_id
            }
            
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/entities",
                headers=SupabaseService._get_headers(),
                json=data
            )
            
            response.raise_for_status()
            return response.json()[0]
        except Exception as e:
            logger.error(f"Error creating entity: {e}")
            raise
    
    @staticmethod
    def get_entities_by_user(user_id: str) -> List[Dict[str, Any]]:
        """Get all entities for a user."""
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/entities",
                headers=SupabaseService._get_headers(),
                params={"user_id": f"eq.{user_id}"}
            )
            
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error getting entities by user: {e}")
            raise
    
    @staticmethod
    def create_relation(relation_type: str, from_entity_id: str, to_entity_id: str, 
                        properties: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new relation between entities."""
        try:
            data = {
                "type": relation_type,
                "from_entity_id": from_entity_id,
                "to_entity_id": to_entity_id,
                "properties": properties,
                "user_id": user_id
            }
            
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/relations",
                headers=SupabaseService._get_headers(),
                json=data
            )
            
            response.raise_for_status()
            return response.json()[0]
        except Exception as e:
            logger.error(f"Error creating relation: {e}")
            raise
    
    @staticmethod
    def get_relations_by_user(user_id: str) -> List[Dict[str, Any]]:
        """Get all relations for a user."""
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/relations",
                headers=SupabaseService._get_headers(),
                params={"user_id": f"eq.{user_id}"}
            )
            
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error getting relations by user: {e}")
            raise
    
    @staticmethod
    def get_knowledge_graph(user_id: str) -> Dict[str, Any]:
        """Get the complete knowledge graph for a user."""
        try:
            entities = SupabaseService.get_entities_by_user(user_id)
            relations = SupabaseService.get_relations_by_user(user_id)
            
            return {
                "entities": entities,
                "relations": relations
            }
        except Exception as e:
            logger.error(f"Error getting knowledge graph: {e}")
            raise
    
    @staticmethod
    def get_entity_by_id(entity_id: str) -> Optional[Dict[str, Any]]:
        """Get an entity by ID."""
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/entities",
                headers=SupabaseService._get_headers(),
                params={"id": f"eq.{entity_id}"}
            )
            
            response.raise_for_status()
            entities = response.json()
            
            if entities and len(entities) > 0:
                return entities[0]
            return None
        except Exception as e:
            logger.error(f"Error getting entity by ID: {e}")
            raise
    
    @staticmethod
    def search_entities(query: str, entity_type: Optional[str] = None, limit: int = 10, user_id: str = None) -> List[Dict[str, Any]]:
        """Search for entities based on a query."""
        try:
            params = {"limit": limit}
            
            if user_id:
                params["user_id"] = f"eq.{user_id}"
            
            if entity_type:
                params["type"] = f"eq.{entity_type}"
            
            # Add search filter
            params["or"] = f"name.ilike.*{query}*,properties.ilike.*{query}*"
            
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/entities",
                headers=SupabaseService._get_headers(),
                params=params
            )
            
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error searching entities: {e}")
            raise

# Default user ID for testing (in a real app, this would come from authentication)
DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000"

def initialize_default_user():
    """Initialize the default user if it doesn't exist."""
    try:
        # Check if default user exists
        user = SupabaseService.get_user_by_email("default@example.com")
        
        if not user:
            # Create default user
            user = SupabaseService.create_user("default@example.com", "Default User")
            logger.info(f"Created default user: {user['id']}")
        
        return user
    except Exception as e:
        logger.error(f"Error initializing default user: {e}")
        raise
