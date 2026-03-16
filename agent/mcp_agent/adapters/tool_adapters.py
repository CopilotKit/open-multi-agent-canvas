"""
Tool compatibility layer for LangGraph and OpenAI Agents SDK.
This module provides adapters to convert tools between LangGraph and OpenAI Agents SDK.
"""

import logging
from typing import Dict, List, Any, Optional, Callable, Awaitable
import asyncio
import inspect

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def adapt_langchain_tool_to_openai(lc_tool: Any) -> Callable:
    """
    Convert a LangChain tool to an OpenAI Agents tool.
    
    Args:
        lc_tool: The LangChain tool to convert
        
    Returns:
        An OpenAI Agents compatible tool
    """
    try:
        # Import here to avoid circular imports and allow optional dependency
        from agents import function_tool as openai_function_tool
        
        @openai_function_tool
        async def adapted_tool(*args, **kwargs):
            """Adapted LangChain tool."""
            # Handle both sync and async tools
            if inspect.iscoroutinefunction(lc_tool.invoke):
                return await lc_tool.invoke(*args, **kwargs)
            else:
                return lc_tool.invoke(*args, **kwargs)
        
        # Copy metadata
        adapted_tool.__name__ = lc_tool.name
        adapted_tool.__doc__ = lc_tool.description
        
        return adapted_tool
    except ImportError:
        logger.warning("OpenAI Agents SDK not installed. Returning mock tool.")
        
        async def mock_tool(*args, **kwargs):
            logger.warning(f"Mock tool called: {lc_tool.name}")
            return f"Mock response from {lc_tool.name}"
        
        return mock_tool

def adapt_openai_tool_to_langchain(openai_tool: Callable) -> Any:
    """
    Convert an OpenAI Agents tool to a LangChain tool.
    
    Args:
        openai_tool: The OpenAI Agents tool to convert
        
    Returns:
        A LangChain compatible tool
    """
    try:
        # Import here to avoid circular imports and allow optional dependency
        from langchain.tools import Tool as LangChainTool
        
        async def _run(*args, **kwargs):
            # Handle both sync and async tools
            if inspect.iscoroutinefunction(openai_tool):
                return await openai_tool(*args, **kwargs)
            else:
                return openai_tool(*args, **kwargs)
        
        return LangChainTool(
            name=openai_tool.__name__,
            description=openai_tool.__doc__,
            func=_run
        )
    except ImportError:
        logger.warning("LangChain not installed. Returning None.")
        return None
