"""
Test script for the knowledge server.
This script tests the basic functionality of the knowledge server.
"""

import asyncio
import json
from mcp_agent.integrations.graphiti_integration import (
    GraphitiKnowledgeSource,
    KnowledgeEntity,
    KnowledgeRelation
)

async def test_knowledge_source():
    """Test the basic functionality of the GraphitiKnowledgeSource."""
    print("Testing GraphitiKnowledgeSource...")
    
    # Initialize the knowledge source
    knowledge_source = GraphitiKnowledgeSource()
    
    # Test entity operations
    print("\n1. Testing entity operations:")
    
    # Create a test entity
    entity = KnowledgeEntity(
        id="test-entity-1",
        type="concept",
        properties={"name": "Test Entity", "description": "This is a test entity"}
    )
    
    # Add the entity
    entity_id = await knowledge_source.add_entity(entity)
    print(f"  - Added entity with ID: {entity_id}")
    
    # Get the entity
    retrieved_entity = await knowledge_source.get_entity(entity_id)
    print(f"  - Retrieved entity: {retrieved_entity.dict()}")
    
    # Test relation operations
    print("\n2. Testing relation operations:")
    
    # Create another test entity
    entity2 = KnowledgeEntity(
        id="test-entity-2",
        type="concept",
        properties={"name": "Related Entity", "description": "This is a related entity"}
    )
    
    # Add the second entity
    entity2_id = await knowledge_source.add_entity(entity2)
    print(f"  - Added second entity with ID: {entity2_id}")
    
    # Create a relation between the entities
    relation = KnowledgeRelation(
        source_id=entity_id,
        target_id=entity2_id,
        type="related_to",
        properties={"strength": 0.8}
    )
    
    # Add the relation
    result = await knowledge_source.add_relation(relation)
    print(f"  - Added relation: {result}")
    
    # Test query operations
    print("\n3. Testing query operations:")
    
    # Query the knowledge graph
    query_result = await knowledge_source.query("test")
    print(f"  - Query result: {query_result.dict()}")
    
    # Search for entities
    search_results = await knowledge_source.search_entities("Test")
    print(f"  - Search results: {[entity.dict() for entity in search_results]}")
    
    print("\nAll tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_knowledge_source())
