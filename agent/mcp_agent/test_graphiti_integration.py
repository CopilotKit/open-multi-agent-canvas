import pytest
import os
from mcp_agent.integrations.graphiti_integration import (
    GraphitiKnowledgeSource,
    KnowledgeEntity,
    KnowledgeRelation,
    KnowledgeQuery
)
from mcp_agent.agent_factory import AgentFactory

pytestmark = pytest.mark.asyncio

class DummyAgent:
    def __init__(self, memory, llm, a2a, knowledge, **kwargs):
        self.memory = memory
        self.llm = llm
        self.a2a = a2a
        self.knowledge = knowledge
        self.kwargs = kwargs

async def test_graphiti_knowledge_source():
    """Test basic functionality of the GraphitiKnowledgeSource"""
    knowledge_source = GraphitiKnowledgeSource()
    
    # Test query
    query_result = await knowledge_source.query("test query")
    assert query_result.entities
    assert len(query_result.entities) > 0
    
    # Test entity operations
    entity = KnowledgeEntity(
        id="test-entity",
        type="test",
        properties={"name": "Test Entity"}
    )
    entity_id = await knowledge_source.add_entity(entity)
    assert entity_id == "test-entity"
    
    retrieved_entity = await knowledge_source.get_entity("test-entity")
    assert retrieved_entity is not None
    assert retrieved_entity.id == "test-entity"
    
    # Test search
    search_results = await knowledge_source.search_entities("test")
    assert len(search_results) > 0
    
    # Test relation
    relation = KnowledgeRelation(
        source_id="entity1",
        target_id="entity2",
        type="related_to"
    )
    result = await knowledge_source.add_relation(relation)
    assert result is True

async def test_agent_factory_graphiti():
    """Test that the agent factory correctly creates and injects the GraphitiKnowledgeSource"""
    os.environ["KNOWLEDGE_BACKEND"] = "graphiti"
    factory = AgentFactory()
    agent = factory.create_agent(DummyAgent, agent_id="test1")
    
    assert agent.knowledge is not None
    assert isinstance(agent.knowledge, GraphitiKnowledgeSource)
