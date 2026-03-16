from typing import Dict, Optional, Callable, Awaitable
from .a2a_protocols import A2AMessage
import asyncio

class A2ACommunicator:
    """
    In-memory, async, extensible communicator for agent-to-agent messaging.
    Can be extended to use HTTP, message brokers, etc.
    """
    def __init__(self):
        # In-memory message queues per agent
        self.queues: Dict[str, asyncio.Queue] = {}
        # Optional: callbacks for message receipt
        self.callbacks: Dict[str, Callable[[A2AMessage], Awaitable[None]]] = {}

    async def send_message(self, message: A2AMessage) -> None:
        """
        Send a message to another agent (by recipient_agent_id).
        """
        queue = self.queues.setdefault(message.recipient_agent_id, asyncio.Queue())
        await queue.put(message)
        # If a callback is registered, call it
        if message.recipient_agent_id in self.callbacks:
            await self.callbacks[message.recipient_agent_id](message)

    async def receive_message(self, agent_id: str, timeout: Optional[float] = None) -> Optional[A2AMessage]:
        """
        Receive the next message for this agent (by agent_id).
        If timeout is set, waits up to timeout seconds.
        """
        queue = self.queues.setdefault(agent_id, asyncio.Queue())
        try:
            message = await asyncio.wait_for(queue.get(), timeout=timeout)
            return message
        except asyncio.TimeoutError:
            return None

    def register_callback(self, agent_id: str, callback: Callable[[A2AMessage], Awaitable[None]]):
        """
        Register a coroutine callback to be called when a message is sent to this agent.
        """
        self.callbacks[agent_id] = callback

    # Extension point: add HTTP, broker, or distributed transport here 