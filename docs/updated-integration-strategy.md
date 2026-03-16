# Updated LangGraph and OpenAI Agents SDK Integration Strategy

This document outlines a refined strategy for integrating our existing LangGraph-based backend with the OpenAI Agents SDK while preserving all current functionality.

## Current Architecture

Our current system uses:
- LangGraph for agent workflow definition (`StateGraph`)
- Custom FastAPI server with health endpoints
- MCP configuration via frontend localStorage
- Server-Sent Events (SSE) for communication
- Modular integrations for memory, LLM, and knowledge

## Integration Goals

1. **Preserve Existing Functionality**: Ensure all current features continue to work
2. **Add OpenAI Agents SDK Support**: Integrate the OpenAI Agents SDK as an alternative execution engine
3. **Unified Configuration**: Single configuration system for both frameworks
4. **Streamlined Backend**: Consolidate server implementations
5. **Frontend Compatibility**: Maintain existing frontend interfaces

## Implementation Strategy

### 1. Unified State Model

Create a unified state model that works with both frameworks:

```python
# In shared_state.py
from typing import Dict, List, Optional, Union, Any
from typing_extensions import TypedDict
from pydantic import BaseModel
from copilotkit import CopilotKitState

# LangGraph uses TypedDict
class LangGraphState(CopilotKitState):
    mcp_config: Optional[Dict[str, Any]]
    conversation_id: Optional[str] = None
    trace_id: Optional[str] = None

# OpenAI Agents uses Pydantic models
class OpenAIAgentsState(BaseModel):
    messages: List[Dict[str, Any]]
    mcp_config: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None
    trace_id: Optional[str] = None

# Conversion functions
def langgraph_to_openai(state: LangGraphState) -> OpenAIAgentsState:
    return OpenAIAgentsState(
        messages=state.get("messages", []),
        mcp_config=state.get("mcp_config"),
        conversation_id=state.get("conversation_id"),
        trace_id=state.get("trace_id")
    )

def openai_to_langgraph(state: OpenAIAgentsState) -> LangGraphState:
    return {
        "messages": state.messages,
        "mcp_config": state.mcp_config,
        "conversation_id": state.conversation_id,
        "trace_id": state.trace_id
    }
```

### 2. Agent Implementation Adapters

Create adapters that allow the same agent logic to be used with either framework:

```python
# In agent_adapters.py
from agents import Agent as OpenAIAgent, Runner
from langgraph.graph import StateGraph

class OpenAIAgentAdapter:
    """Adapts our LangGraph agent to work with OpenAI Agents SDK"""
    
    def __init__(self, name, instructions, tools):
        self.openai_agent = OpenAIAgent(
            name=name,
            instructions=instructions,
            tools=tools
        )
        
    async def process(self, state):
        # Convert LangGraph state to OpenAI Agents format
        openai_state = langgraph_to_openai(state)
        
        # Run the OpenAI agent
        result = await Runner.run(self.openai_agent, openai_state.messages)
        
        # Convert result back to LangGraph format
        return {
            "messages": state["messages"] + result.new_messages,
            "conversation_id": result.conversation_id or state.get("conversation_id"),
            "trace_id": result.trace_id or state.get("trace_id")
        }

class LangGraphAgentAdapter:
    """Adapts OpenAI Agents to work with LangGraph"""
    
    def __init__(self, openai_agent):
        self.openai_agent = openai_agent
        
    async def __call__(self, state):
        # This function will be used as a LangGraph node
        openai_state = langgraph_to_openai(state)
        result = await Runner.run(self.openai_agent, openai_state.messages)
        return {
            "messages": state["messages"] + result.new_messages,
            "conversation_id": result.conversation_id or state.get("conversation_id"),
            "trace_id": result.trace_id or state.get("trace_id")
        }
```

### 3. Tool Compatibility Layer

Create a compatibility layer for tools to work with both frameworks:

```python
# In tool_adapters.py
from agents import function_tool as openai_function_tool
from langchain.tools import Tool as LangChainTool

def adapt_langchain_tool_to_openai(lc_tool):
    """Convert a LangChain tool to an OpenAI Agents tool"""
    @openai_function_tool
    async def adapted_tool(*args, **kwargs):
        return await lc_tool.invoke(*args, **kwargs)
    
    # Copy metadata
    adapted_tool.__name__ = lc_tool.name
    adapted_tool.__doc__ = lc_tool.description
    
    return adapted_tool

def adapt_openai_tool_to_langchain(openai_tool):
    """Convert an OpenAI Agents tool to a LangChain tool"""
    async def _run(*args, **kwargs):
        return await openai_tool(*args, **kwargs)
    
    return LangChainTool(
        name=openai_tool.__name__,
        description=openai_tool.__doc__,
        func=_run
    )
```

### 4. Unified Server Implementation

Enhance the server to support both frameworks:

```python
# In server.py
from fastapi import FastAPI, Request
from pydantic import BaseModel

app = FastAPI()

class FrameworkMode(str, Enum):
    LANGGRAPH = "langgraph"
    OPENAI_AGENTS = "openai_agents"
    HYBRID = "hybrid"

# Configuration endpoint to set the mode
@app.post("/config/mode")
async def set_mode(mode: FrameworkMode):
    # Store the mode in a global config or database
    current_mode = mode
    return {"mode": current_mode}

# Unified invoke endpoint that works with both frameworks
@app.post("/v1/invoke")
async def invoke(request: Request):
    data = await request.json()
    
    if current_mode == FrameworkMode.LANGGRAPH:
        # Use LangGraph processing
        return await process_with_langgraph(data)
    elif current_mode == FrameworkMode.OPENAI_AGENTS:
        # Use OpenAI Agents processing
        return await process_with_openai_agents(data)
    else:
        # Hybrid mode - try OpenAI Agents first, fall back to LangGraph
        try:
            return await process_with_openai_agents(data)
        except Exception as e:
            logger.warning(f"OpenAI Agents processing failed: {e}, falling back to LangGraph")
            return await process_with_langgraph(data)
```

### 5. Factory Method for Agent Creation

Enhance the agent factory to support both frameworks:

```python
# In agent_factory.py
class AgentFactory:
    def __init__(self, config=None):
        self.config = config or self._load_config_from_env()
        self.framework = self.config.get("FRAMEWORK", "langgraph").lower()
        # ... existing initialization ...
    
    def create_agent(self, agent_class, **kwargs):
        """Create an agent with the appropriate framework"""
        # Common components
        memory = self.get_memory_manager()
        llm = self.get_llm_client()
        a2a = self.get_a2a_communicator()
        knowledge = self.get_knowledge_source()
        logger = self.get_logger()
        
        if self.framework == "openai_agents":
            # Create an OpenAI Agents SDK agent
            return self._create_openai_agent(
                memory, llm, a2a, knowledge, logger, **kwargs
            )
        else:
            # Create a LangGraph agent (default)
            return self._create_langgraph_agent(
                agent_class, memory, llm, a2a, knowledge, logger, **kwargs
            )
    
    def _create_langgraph_agent(self, agent_class, memory, llm, a2a, knowledge, logger, **kwargs):
        # Existing implementation for LangGraph agents
        return agent_class(memory=memory, llm=llm, a2a=a2a, knowledge=knowledge, **kwargs)
    
    def _create_openai_agent(self, memory, llm, a2a, knowledge, logger, **kwargs):
        # New implementation for OpenAI Agents
        # Convert our components to OpenAI Agents compatible format
        adapted_memory = self._adapt_memory_to_openai(memory)
        adapted_llm = self._adapt_llm_to_openai(llm)
        adapted_tools = self._get_openai_tools(a2a, knowledge)
        
        # Create the OpenAI agent
        return OpenAIAgent(
            name=kwargs.get("agent_id", "assistant"),
            instructions=kwargs.get("instructions", "You are a helpful assistant."),
            tools=adapted_tools,
            # Additional OpenAI Agent parameters
        )
```

### 6. Configuration Management

Create a unified configuration system:

```python
# In config.py
def load_config(framework="langgraph"):
    """Load configuration for the specified framework"""
    # Base configuration common to both frameworks
    base_config = {
        "MEMORY_BACKEND": os.getenv("MEMORY_BACKEND", "memorysaver"),
        "LLM_BACKEND": os.getenv("LLM_BACKEND", "litellm"),
        "KNOWLEDGE_BACKEND": os.getenv("KNOWLEDGE_BACKEND", "graphiti"),
        "LOGGING_ENABLED": os.getenv("LOGGING_ENABLED", "true"),
    }
    
    # Framework-specific configuration
    if framework == "openai_agents":
        openai_config = {
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
            "DEFAULT_MODEL": os.getenv("DEFAULT_MODEL", "gpt-4o"),
        }
        return {**base_config, **openai_config}
    else:
        langgraph_config = {
            "LANGGRAPH_HOST": os.getenv("LANGGRAPH_HOST", "localhost"),
            "LANGGRAPH_PORT": os.getenv("LANGGRAPH_PORT", "8123"),
        }
        return {**base_config, **langgraph_config}
```

### 7. Frontend Compatibility

Ensure the frontend works with both backends:

```typescript
// In mcp-agent.tsx
const [framework, setFramework] = useState<'langgraph' | 'openai_agents' | 'hybrid'>('hybrid');

// Add framework selection to the UI
const changeFramework = async (newFramework: 'langgraph' | 'openai_agents' | 'hybrid') => {
  try {
    const backendUrl = (configsRef.current["mcp-agent"] as SSEConfig)?.url || "http://localhost:8123";
    await fetch(`${backendUrl}/config/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: newFramework })
    });
    setFramework(newFramework);
  } catch (error) {
    console.error("Failed to change framework:", error);
  }
};
```

## Implementation Plan

### Phase 1: Foundation (Week 1)

1. Create the unified state model
2. Implement basic adapters for agent and tool compatibility
3. Update the server to support framework selection
4. Add configuration management for both frameworks

### Phase 2: Integration (Week 2)

1. Enhance the agent factory to support both frameworks
2. Implement the full tool compatibility layer
3. Update the frontend to support framework selection
4. Create comprehensive tests for both frameworks

### Phase 3: Optimization (Week 3)

1. Optimize performance for both frameworks
2. Add advanced features like agent handoffs
3. Implement monitoring and logging for both frameworks
4. Create documentation and examples

## Testing Strategy

1. **Unit Tests**: Test each adapter and compatibility layer
2. **Integration Tests**: Test end-to-end workflows with both frameworks
3. **Performance Tests**: Compare performance between frameworks
4. **Compatibility Tests**: Ensure all existing features work with both frameworks

## Conclusion

This integration strategy allows us to leverage both LangGraph and OpenAI Agents SDK while maintaining all existing functionality. By using adapters and a unified configuration system, we can provide a seamless experience regardless of which framework is used under the hood.

The approach gives us the flexibility to choose the most appropriate framework for each deployment scenario while working from a unified codebase. It also future-proofs our application by allowing us to adopt new features from either framework as they become available.
