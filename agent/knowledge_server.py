# knowledge_server.py
from mcp.server.fastmcp import FastMCP
from mcp_agent.integrations.graphiti_integration import GraphitiKnowledgeSource
import asyncio
import json

# Create the MCP server
mcp = FastMCP("Knowledge")

# Initialize the knowledge source
knowledge_source = GraphitiKnowledgeSource()

@mcp.tool()
async def query_knowledge(query: str) -> dict:
    """
    Query the knowledge graph with a natural language query.
    Returns entities and relations matching the query.
    """
    result = await knowledge_source.query(query)
    # Convert to dict for JSON serialization
    return {
        "entities": [entity.dict() for entity in result.entities],
        "relations": [relation.dict() for relation in result.relations]
    }

@mcp.tool()
async def search_entities(query: str, entity_type: str = None, limit: int = 10) -> list:
    """
    Search for entities in the knowledge graph.
    
    Args:
        query: The search query
        entity_type: Optional type of entity to filter by
        limit: Maximum number of results to return
    
    Returns:
        List of matching entities
    """
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
    entity = await knowledge_source.get_entity(entity_id)
    if entity:
        return entity.dict()
    return None

@mcp.tool()
async def add_entity(entity_id: str, entity_type: str, properties: dict) -> str:
    """
    Add a new entity to the knowledge graph.
    
    Args:
        entity_id: Unique identifier for the entity
        entity_type: Type of the entity (e.g., "person", "organization")
        properties: Dictionary of entity properties
    
    Returns:
        ID of the created entity
    """
    from mcp_agent.integrations.graphiti_integration import KnowledgeEntity
    
    entity = KnowledgeEntity(
        id=entity_id,
        type=entity_type,
        properties=properties
    )
    
    return await knowledge_source.add_entity(entity)

@mcp.tool()
async def add_relation(source_id: str, target_id: str, relation_type: str, properties: dict = None) -> bool:
    """
    Add a relation between two entities in the knowledge graph.
    
    Args:
        source_id: ID of the source entity
        target_id: ID of the target entity
        relation_type: Type of relation (e.g., "works_for", "located_in")
        properties: Optional properties for the relation
    
    Returns:
        True if successful, False otherwise
    """
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
