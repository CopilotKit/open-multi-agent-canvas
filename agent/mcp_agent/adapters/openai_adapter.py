"""
Adapter for OpenAI Agents SDK integration.
This module provides adapters to use OpenAI Agents SDK with the existing LangGraph architecture.
"""

import logging
from typing import Dict, List, Any, Optional, Callable, Awaitable
import asyncio

# Import shared state models
from mcp_agent.shared_state import langgraph_to_openai, openai_to_langgraph

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIAgentAdapter:
    """
    Adapts our LangGraph agent to work with OpenAI Agents SDK.
    This adapter allows using OpenAI Agents SDK with our existing architecture.
    """
    
    def __init__(self, name: str, instructions: str, tools: List[Any]):
        """
        Initialize the OpenAI Agent adapter.
        
        Args:
            name: The name of the agent
            instructions: The instructions for the agent
            tools: The tools available to the agent
        """
        # Import here to avoid circular imports and allow optional dependency
        try:
            from agents import Agent as OpenAIAgent
            self.openai_agent = OpenAIAgent(
                name=name,
                instructions=instructions,
                tools=tools
            )
        except ImportError:
            logger.warning("OpenAI Agents SDK not installed. Using mock implementation.")
            self.openai_agent = None
        
    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the state using the OpenAI agent.
        
        Args:
            state: The LangGraph state
            
        Returns:
            The updated LangGraph state
        """
        if self.openai_agent is None:
            logger.error("OpenAI Agents SDK not available. Cannot process state.")
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
