"""
Adapter for LangGraph integration.
This module provides adapters to use OpenAI Agents with LangGraph.
"""

import logging
from typing import Dict, List, Any, Optional, Callable, Awaitable
import asyncio

# Import shared state models
from mcp_agent.shared_state import langgraph_to_openai, openai_to_langgraph

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LangGraphAgentAdapter:
    """
    Adapts OpenAI Agents to work with LangGraph.
    This adapter allows using OpenAI Agents as LangGraph nodes.
    """
    
    def __init__(self, openai_agent: Any):
        """
        Initialize the LangGraph Agent adapter.
        
        Args:
            openai_agent: The OpenAI agent to adapt
        """
        self.openai_agent = openai_agent
        
    async def __call__(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the state using the OpenAI agent.
        This function will be used as a LangGraph node.
        
        Args:
            state: The LangGraph state
            
        Returns:
            The updated LangGraph state
        """
        if self.openai_agent is None:
            logger.error("OpenAI agent not available. Cannot process state.")
            return state
            
        # Import here to avoid circular imports and allow optional dependency
        try:
            from agents import Runner
            
            # Convert LangGraph state to OpenAI Agents format
            openai_state = langgraph_to_openai(state)
            
            # Run the OpenAI agent
            result = await Runner.run(self.openai_agent, openai_state.messages)
            
            # Convert result back to LangGraph format
            return {
                "messages": state["messages"] + result.new_messages,
                "conversation_id": result.conversation_id or state.get("conversation_id"),
                "trace_id": result.trace_id or state.get("trace_id"),
                "mcp_config": state.get("mcp_config")
            }
        except ImportError:
            logger.error("OpenAI Agents SDK not available. Cannot process state.")
            return state
        except Exception as e:
            logger.error(f"Error processing state with OpenAI agent: {e}")
            return state
