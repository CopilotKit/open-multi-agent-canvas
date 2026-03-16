from typing import Optional, Dict, Any, List, Union
from pydantic import BaseModel, Field
from datetime import datetime

class TaskRequestPayload(BaseModel):
    """
    Example payload for requesting a task from another agent.
    Extend as needed for your domain.
    """
    task_type: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    context: Optional[Dict[str, Any]] = None

class TaskResponsePayload(BaseModel):
    """
    Example payload for responding to a task request.
    """
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None

class A2AMessage(BaseModel):
    """
    Standardized message for agent-to-agent communication.
    """
    sender_agent_id: str
    recipient_agent_id: str
    message_type: str  # e.g., 'task_request', 'task_response', 'status', etc.
    payload: Union[TaskRequestPayload, TaskResponsePayload, Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

class CapabilityDiscoveryPayload(BaseModel):
    """
    Payload for capability discovery between agents.
    """
    capabilities: List[str]
    agent_version: Optional[str] = None
    extra: Optional[Dict[str, Any]] = None

# You can extend with more message types as needed (negotiation, state sync, etc.) 