"""
Shared state model for LangGraph and OpenAI Agents SDK integration.
This module defines state models compatible with both frameworks and provides
conversion functions between them.
"""

from typing import Dict, List, Optional, Union, Any
from typing_extensions import TypedDict
from pydantic import BaseModel, Field

# LangGraph uses TypedDict for state
class LangGraphState(TypedDict, total=False):
    """State model for LangGraph."""
    messages: List[Dict[str, Any]]
    mcp_config: Optional[Dict[str, Any]]
    conversation_id: Optional[str]
    trace_id: Optional[str]

# OpenAI Agents uses Pydantic models
class OpenAIAgentsState(BaseModel):
    """State model for OpenAI Agents SDK."""
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    mcp_config: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None
    trace_id: Optional[str] = None

def langgraph_to_openai(state: LangGraphState) -> OpenAIAgentsState:
    """Convert LangGraph state to OpenAI Agents state."""
    return OpenAIAgentsState(
        messages=state.get("messages", []),
        mcp_config=state.get("mcp_config"),
        conversation_id=state.get("conversation_id"),
        trace_id=state.get("trace_id")
    )

def openai_to_langgraph(state: OpenAIAgentsState) -> LangGraphState:
    """Convert OpenAI Agents state to LangGraph state."""
    return {
        "messages": state.messages,
        "mcp_config": state.mcp_config,
        "conversation_id": state.conversation_id,
        "trace_id": state.trace_id
    }
