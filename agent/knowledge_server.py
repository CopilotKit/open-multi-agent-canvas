# knowledge_server.py
from mcp.server.fastmcp import FastMCP
from mcp_agent.integrations.graphiti_integration import GraphitiKnowledgeSource
import asyncio
import json
import uuid
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the MCP server
mcp = FastMCP("Knowledge")

# Initialize the knowledge source
knowledge_source = GraphitiKnowledgeSource()

# Determine which database backend to use
DATABASE_BACKEND = os.getenv("DATABASE_BACKEND", "postgres").lower()

if DATABASE_BACKEND == "supabase":
    from mcp_agent.database.supabase_service import SupabaseService as DatabaseService
    from mcp_agent.database.supabase_service import initialize_default_user, DEFAULT_USER_ID

    # Initialize the database and default user
    try:
        # Initialize default user
        user = initialize_default_user()
        logger.info(f"Using Supabase backend with default user: {DEFAULT_USER_ID}")
    except Exception as e:
        logger.error(f"Error initializing Supabase: {e}")

else:  # Default to PostgreSQL
    from mcp_agent.database.service import DatabaseService

    # Initialize the database
    try:
        DatabaseService.initialize_database()
        logger.info("PostgreSQL database initialized successfully")

        # Default user ID for testing (in a real app, this would come from authentication)
        DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000"

        # Create default user if it doesn't exist
        user = DatabaseService.get_user_by_email("default@example.com")
        if not user:
            user = DatabaseService.create_user("default@example.com", "Default User")
            logger.info(f"Created default user: {user['id']}")
        DEFAULT_USER_ID = user['id']
    except Exception as e:
        logger.error(f"Error initializing PostgreSQL database: {e}")

@mcp.tool()
async def query_knowledge(query: str, user_id: str = None) -> dict:
    """
    Query the knowledge graph with a natural language query.
    Returns entities and relations matching the query.

    Args:
        query: The search query
        user_id: Optional user ID (defaults to DEFAULT_USER_ID)

    Returns:
        Dictionary with entities and relations matching the query
    """
    try:
        # First try to get from database
        user_id = user_id or DEFAULT_USER_ID
        logger.info(f"Querying knowledge graph for user {user_id}: {query}")

        # Get all entities and relations for the user
        knowledge_graph = DatabaseService.get_knowledge_graph(user_id)

        # Filter entities based on the query
        filtered_entities = []
        for entity in knowledge_graph["entities"]:
            # Simple string matching for now
            if (query.lower() in entity["name"].lower() or
                query.lower() in entity["type"].lower() or
                any(query.lower() in str(value).lower() for value in entity["properties"].values())):
                filtered_entities.append(entity)

        # Get relations that connect the filtered entities
        entity_ids = [entity["id"] for entity in filtered_entities]
        filtered_relations = []
        for relation in knowledge_graph["relations"]:
            if relation["from_entity_id"] in entity_ids and relation["to_entity_id"] in entity_ids:
                filtered_relations.append(relation)

        return {
            "entities": filtered_entities,
            "relations": filtered_relations
        }
    except Exception as e:
        logger.error(f"Error querying knowledge graph: {e}")
        # Fall back to the original implementation
        result = await knowledge_source.query(query)
        return {
            "entities": [entity.dict() for entity in result.entities],
            "relations": [relation.dict() for relation in result.relations]
        }

@mcp.tool()
async def search_entities(query: str, entity_type: str = None, limit: int = 10, user_id: str = None) -> list:
    """
    Search for entities in the knowledge graph.

    Args:
        query: The search query
        entity_type: Optional type of entity to filter by
        limit: Maximum number of results to return
        user_id: Optional user ID (defaults to DEFAULT_USER_ID)

    Returns:
        List of matching entities
    """
    try:
        # First try to get from database
        user_id = user_id or DEFAULT_USER_ID
        logger.info(f"Searching entities for user {user_id}: {query} (type={entity_type}, limit={limit})")

        # Get all entities for the user
        entities = DatabaseService.get_entities_by_user(user_id)

        # Filter entities based on the query and type
        filtered_entities = []
        for entity in entities:
            # Apply type filter if specified
            if entity_type and entity["type"] != entity_type:
                continue

            # Simple string matching for now
            if (query.lower() in entity["name"].lower() or
                any(query.lower() in str(value).lower() for value in entity["properties"].values())):
                filtered_entities.append(entity)

            # Respect the limit
            if len(filtered_entities) >= limit:
                break

        return filtered_entities
    except Exception as e:
        logger.error(f"Error searching entities: {e}")
        # Fall back to the original implementation
        entities = await knowledge_source.search_entities(query, entity_type, limit)
        return [entity.dict() for entity in entities]

@mcp.tool()
async def get_entity(entity_id: str) -> dict:
    """
    Get details about a specific entity by ID.

    Args:
        entity_id: The ID of the entity to retrieve

    Returns:
        Entity details or None if not found
    """
    try:
        # Try to get from database using a direct query
        # Note: This is a simplified implementation. In a real app, you would have a proper get_entity_by_id method
        conn = DatabaseService.get_connection()
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT id, name, type, properties, created_at, updated_at, user_id
            FROM entities
            WHERE id = %s
        """, (entity_id,))

        entity = cursor.fetchone()
        cursor.close()
        conn.close()

        if entity:
            return dict(entity)
    except Exception as e:
        logger.error(f"Error getting entity from database: {e}")

    # Fall back to the original implementation
    entity = await knowledge_source.get_entity(entity_id)
    if entity:
        return entity.dict()
    return None

@mcp.tool()
async def add_entity(entity_id: str, entity_type: str, properties: dict, user_id: str = None) -> str:
    """
    Add a new entity to the knowledge graph.

    Args:
        entity_id: Unique identifier for the entity (optional, will be generated if not provided)
        entity_type: Type of the entity (e.g., "person", "organization")
        properties: Dictionary of entity properties
        user_id: Optional user ID (defaults to DEFAULT_USER_ID)

    Returns:
        ID of the created entity
    """
    try:
        # First try to add to database
        user_id = user_id or DEFAULT_USER_ID
        logger.info(f"Adding entity for user {user_id}: {entity_type}")

        # Make sure we have a name property
        if "name" not in properties and "title" in properties:
            properties["name"] = properties["title"]
        elif "name" not in properties:
            properties["name"] = f"{entity_type}-{entity_id[:8] if entity_id else str(uuid.uuid4())[:8]}"

        # Create the entity in the database
        entity = DatabaseService.create_entity(
            name=properties["name"],
            entity_type=entity_type,
            properties=properties,
            user_id=user_id
        )

        return entity["id"]
    except Exception as e:
        logger.error(f"Error adding entity to database: {e}")
        # Fall back to the original implementation
        from mcp_agent.integrations.graphiti_integration import KnowledgeEntity

        entity = KnowledgeEntity(
            id=entity_id or str(uuid.uuid4()),
            type=entity_type,
            properties=properties
        )

        return await knowledge_source.add_entity(entity)

@mcp.tool()
async def add_relation(source_id: str, target_id: str, relation_type: str, properties: dict = None, user_id: str = None) -> bool:
    """
    Add a relation between two entities in the knowledge graph.

    Args:
        source_id: ID of the source entity
        target_id: ID of the target entity
        relation_type: Type of relation (e.g., "works_for", "located_in")
        properties: Optional properties for the relation
        user_id: Optional user ID (defaults to DEFAULT_USER_ID)

    Returns:
        True if successful, False otherwise
    """
    try:
        # First try to add to database
        user_id = user_id or DEFAULT_USER_ID
        logger.info(f"Adding relation for user {user_id}: {source_id} -> {target_id} ({relation_type})")

        # Create the relation in the database
        relation = DatabaseService.create_relation(
            relation_type=relation_type,
            from_entity_id=source_id,
            to_entity_id=target_id,
            properties=properties or {},
            user_id=user_id
        )

        return True
    except Exception as e:
        logger.error(f"Error adding relation to database: {e}")
        # Fall back to the original implementation
        from mcp_agent.integrations.graphiti_integration import KnowledgeRelation

        relation = KnowledgeRelation(
            source_id=source_id,
            target_id=target_id,
            type=relation_type,
            properties=properties or {}
        )

        return await knowledge_source.add_relation(relation)

if __name__ == "__main__":
    mcp.run(transport="stdio")
