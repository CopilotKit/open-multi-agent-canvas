"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

import os
import uuid
import logging
from typing_extensions import Literal, TypedDict, Dict, List, Union, Optional
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command
from copilotkit import CopilotKitState
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# Import LogfireLogger from the correct location
from mcp_agent.integrations.logfire_integration import LogfireLogger

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the connection type structures
class StdioConnection(TypedDict):
    command: str
    args: List[str]
    transport: Literal["stdio"]

class SSEConnection(TypedDict):
    url: str
    transport: Literal["sse"]

# Type for MCP configuration
MCPConfig = Dict[str, Union[StdioConnection, SSEConnection]]

class AgentState(CopilotKitState):
    """
    Here we define the state of the agent

    In this instance, we're inheriting from CopilotKitState, which will bring in
    the CopilotKitState fields. We're also adding custom fields for configuration.
    """
    # Define mcp_config as an optional field without skipping validation
    mcp_config: Optional[MCPConfig]
    # Unique conversation ID for tracing
    conversation_id: Optional[str] = None
    # Trace ID for Logfire
    trace_id: Optional[str] = None

# Default MCP configuration to use when no configuration is provided in the state
# Uses relative paths that will work within the project structure
DEFAULT_MCP_CONFIG: MCPConfig = {
    "math": {
        "command": "python",
        # Use a relative path that will be resolved based on the current working directory
        "args": [os.path.join(os.path.dirname(__file__), "..", "math_server.py")],
        "transport": "stdio",
    },
    "knowledge": {
        "command": "python",
        "args": [os.path.join(os.path.dirname(__file__), "..", "knowledge_server.py")],
        "transport": "stdio",
    },
}

# Define a custom ReAct prompt that encourages the use of multiple tools
MULTI_TOOL_REACT_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an assistant that can use multiple tools to solve problems.
You should use a step-by-step approach, using as many tools as needed to find the complete answer.
Don't hesitate to call different tools sequentially if that helps reach a better solution.

You have access to the following tools:

{{tools}}

To use a tool, please use the following format:
```
Thought: I need to use a tool to help with this.
Action: tool_name
Action Input: the input to the tool
```

The observation will be returned in the following format:
```
Observation: tool result
```

When you have the final answer, respond in the following format:
```
Thought: I can now provide the final answer.
Final Answer: the final answer to the original input
```

Begin!
"""
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

# Initialize Logfire logger
logfire_logger = LogfireLogger()

async def chat_node(state: AgentState, config: RunnableConfig) -> Command[Literal["__end__"]]:
    """
    This is an enhanced agent that uses a modified ReAct pattern to allow multiple tool use.
    It handles both chat responses and sequential tool execution in one node.
    """
    # Ensure we have a conversation ID and trace ID for logging
    conversation_id = state.get("conversation_id") or str(uuid.uuid4())
    trace_id = state.get("trace_id") or str(uuid.uuid4())

    # Get MCP configuration from state, or use the default config if not provided
    mcp_config = state.get("mcp_config", DEFAULT_MCP_CONFIG)

    # Extract the latest user message for logging
    latest_user_message = ""
    if state["messages"] and len(state["messages"]) > 0:
        for msg in reversed(state["messages"]):
            if msg.get("role") == "user":
                latest_user_message = msg.get("content", "")
                break

    # Log the start of processing with Logfire
    logfire_logger.log_event("chat_processing_started", {
        "conversation_id": conversation_id,
        "trace_id": trace_id,
        "user_message": latest_user_message,
        "message_count": len(state["messages"]),
    })

    # Set up the MCP client and tools using the configuration from state
    async with logfire_logger.span("mcp_client_setup", {
        "conversation_id": conversation_id,
        "trace_id": trace_id,
    }):
        async with MultiServerMCPClient(mcp_config) as mcp_client:
            # Get the tools
            mcp_tools = mcp_client.get_tools()
            logger.info(f"MCP tools loaded: {len(mcp_tools)} tools available")

            # Log tool information
            tool_names = [tool.name for tool in mcp_tools]
            logfire_logger.log_event("tools_loaded", {
                "conversation_id": conversation_id,
                "trace_id": trace_id,
                "tool_count": len(mcp_tools),
                "tool_names": tool_names,
            })

            # Create a model instance with Logfire tracing
            model_name = "gpt-4o"
            with logfire_logger.span("llm_setup", {
                "conversation_id": conversation_id,
                "trace_id": trace_id,
                "model": model_name,
            }):
                model = ChatOpenAI(model=model_name)

                # Log model information
                logfire_logger.log_event("model_initialized", {
                    "conversation_id": conversation_id,
                    "trace_id": trace_id,
                    "model": model_name,
                })

            # Create the enhanced multi-tool react agent with our custom prompt
            react_agent = create_react_agent(
                model,
                mcp_tools,
                prompt=MULTI_TOOL_REACT_PROMPT
            )

        # Prepare messages for the react agent
        agent_input = {
            "messages": state["messages"]
        }

        # Run the react agent subgraph with our input and trace with Logfire
        async with logfire_logger.span("agent_execution", {
            "conversation_id": conversation_id,
            "trace_id": trace_id,
            "message_count": len(state["messages"]),
        }):
            try:
                agent_response = await react_agent.ainvoke(agent_input)

                # Log successful agent response
                logfire_logger.log_event("agent_execution_completed", {
                    "conversation_id": conversation_id,
                    "trace_id": trace_id,
                    "response_message_count": len(agent_response.get("messages", [])),
                })
            except Exception as e:
                # Log error if agent execution fails
                logfire_logger.log_error(e, {
                    "conversation_id": conversation_id,
                    "trace_id": trace_id,
                    "error_location": "agent_execution",
                })
                # Re-raise the exception
                raise

        logger.info(f"Agent completed processing with {len(agent_response.get('messages', []))} response messages")

        # Update the state with the new messages
        updated_messages = state["messages"] + agent_response.get("messages", [])

        # Extract agent's response for logging
        agent_response_text = ""
        if agent_response.get("messages"):
            for msg in agent_response.get("messages", []):
                if msg.get("role") == "assistant":
                    agent_response_text = msg.get("content", "")
                    break

        # Log completion
        logfire_logger.log_event("chat_processing_completed", {
            "conversation_id": conversation_id,
            "trace_id": trace_id,
            "total_message_count": len(updated_messages),
            "response_length": len(agent_response_text),
        })

        # End the graph with the updated messages and trace IDs
        return Command(
            goto=END,
            update={
                "messages": updated_messages,
                "conversation_id": conversation_id,
                "trace_id": trace_id,
            },
        )

# Define the workflow graph with only a chat node
workflow = StateGraph(AgentState)
workflow.add_node("chat_node", chat_node)
workflow.set_entry_point("chat_node")

# Compile the workflow graph
graph = workflow.compile(MemorySaver())