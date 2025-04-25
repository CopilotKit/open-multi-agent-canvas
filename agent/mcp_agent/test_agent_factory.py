import pytest
import os
# Removed unused import: from mcp_agent.integrations.mem0_integration import Mem0MemoryManager
from mcp_agent.integrations.memorysaver_manager import MemorySaverManager
from mcp_agent.integrations.litellm_integration import LiteLLMWrapper
from mcp_agent.integrations.a2a_integration import A2ACommunicator
from mcp_agent.integrations.a2a_protocols import A2AMessage, TaskRequestPayload
from mcp_agent.agent_factory import AgentFactory

pytestmark = pytest.mark.asyncio

class DummyAgent:
    def __init__(self, memory, llm, a2a, knowledge, **kwargs):
        self.memory = memory
        self.llm = llm
        self.a2a = a2a
        self.knowledge = knowledge
        self.kwargs = kwargs

async def test_memorysaver_manager(tmp_path):
    manager = MemorySaverManager(storage_path=str(tmp_path / "memsaver.json"))
    await manager.add_memory("user1", content="hello world")
    results = await manager.search_memory("user1", query="hello")
    assert results and results[0]["content"] == "hello world"
    all_memories = await manager.get_all_memories("user1")
    assert len(all_memories) == 1
    await manager.update_memory("0", {"content": "updated"})
    updated = await manager.get_memory("0")
    assert updated["content"] == "updated"
    await manager.delete_memory("0")
    assert await manager.get_memory("0") is None

async def test_a2a_communicator():
    comm = A2ACommunicator()
    msg = A2AMessage(
        sender_agent_id="a1",
        recipient_agent_id="a2",
        message_type="task_request",
        payload=TaskRequestPayload(task_type="echo", parameters={"msg": "hi"}),
    )
    await comm.send_message(msg)
    received = await comm.receive_message("a2", timeout=1)
    assert received and received.sender_agent_id == "a1"

async def test_agent_factory_memorysaver():
    os.environ["MEMORY_BACKEND"] = "memorysaver"
    factory = AgentFactory()
    agent = factory.create_agent(DummyAgent, agent_id="test1")
    assert isinstance(agent.memory, MemorySaverManager)
    assert isinstance(agent.llm, LiteLLMWrapper)
    assert isinstance(agent.a2a, A2ACommunicator)

# Add more tests for Mem0MemoryManager and LiteLLMWrapper as needed (mock external APIs) 