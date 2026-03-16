"""
Logfire integration for the MCP Agent.
Provides logging and tracing capabilities for the agent.
"""

import os
import logging
from typing import Optional, Dict, Any, List, Union
from contextlib import contextmanager

# Try to import logfire, but provide a fallback if it's not installed
try:
    import logfire
    LOGFIRE_AVAILABLE = True
except ImportError:
    LOGFIRE_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("Logfire module not found. Using fallback logging.")

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LogfireLogger:
    """
    Integration with Logfire for logging and tracing.
    Provides methods to log events, errors, and create spans for tracing.
    """

    def __init__(self, project_name: Optional[str] = None, enabled: bool = True):
        """
        Initialize the Logfire logger.

        Args:
            project_name: Name of the Logfire project. Defaults to LOGFIRE_PROJECT env var or 'kb-multi-agent'.
            enabled: Whether Logfire logging is enabled. Defaults to True.
        """
        self.project_name = project_name or os.getenv("LOGFIRE_PROJECT", "kb-multi-agent")
        # Only enable if logfire is available and configured
        self.enabled = enabled and LOGFIRE_AVAILABLE and self._check_logfire_configured()

        if self.enabled:
            try:
                # Initialize Logfire
                logfire.configure(
                    project=self.project_name,
                    service="mcp-agent",
                )
                logger.info(f"Logfire initialized for project: {self.project_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize Logfire: {e}")
                self.enabled = False

    def _check_logfire_configured(self) -> bool:
        """Check if Logfire is configured in the environment."""
        # If logfire is not available, return False
        if not LOGFIRE_AVAILABLE:
            return False

        # Check for Logfire configuration file or environment variables
        if os.path.exists(os.path.expanduser("~/.logfire/default.toml")):
            return True
        if os.getenv("LOGFIRE_TOKEN"):
            return True
        return False

    def log_event(self, event_name: str, data: Optional[Dict[str, Any]] = None) -> None:
        """
        Log an event to Logfire.

        Args:
            event_name: Name of the event
            data: Additional data to log with the event
        """
        if not self.enabled:
            # Fallback to standard logging
            logger.info(f"Event: {event_name} - Data: {data}")
            return

        try:
            logfire.log(event_name, **(data or {}))
        except Exception as e:
            logger.warning(f"Failed to log event to Logfire: {e}")

    def log_error(self, error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
        """
        Log an error to Logfire.

        Args:
            error: The exception to log
            context: Additional context data
        """
        if not self.enabled:
            # Fallback to standard logging
            logger.error(f"Error: {error} - Context: {context}")
            return

        try:
            logfire.error(
                error,
                error_message=str(error),
                **(context or {})
            )
        except Exception as e:
            logger.warning(f"Failed to log error to Logfire: {e}")

    @contextmanager
    def span(self, name: str, attributes: Optional[Dict[str, Any]] = None):
        """
        Create a span for tracing.

        Args:
            name: Name of the span
            attributes: Additional attributes for the span
        """
        if not self.enabled:
            # Log span start/end with standard logging
            logger.info(f"Span start: {name} - Attributes: {attributes}")
            yield None
            logger.info(f"Span end: {name}")
            return

        try:
            with logfire.span(name, **(attributes or {})) as span:
                yield span
        except Exception as e:
            logger.warning(f"Failed to create Logfire span: {e}")
            yield None

    def log_agent_request(self,
                         agent_id: str,
                         user_input: str,
                         metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Log an agent request.

        Args:
            agent_id: ID of the agent
            user_input: User input text
            metadata: Additional metadata
        """
        data = {
            "agent_id": agent_id,
            "user_input": user_input,
            **(metadata or {})
        }
        self.log_event("agent_request", data)

    def log_agent_response(self,
                          agent_id: str,
                          response: str,
                          metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Log an agent response.

        Args:
            agent_id: ID of the agent
            response: Agent response text
            metadata: Additional metadata
        """
        data = {
            "agent_id": agent_id,
            "response": response,
            **(metadata or {})
        }
        self.log_event("agent_response", data)

    def log_tool_call(self,
                     tool_name: str,
                     inputs: Dict[str, Any],
                     metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Log a tool call.

        Args:
            tool_name: Name of the tool
            inputs: Tool inputs
            metadata: Additional metadata
        """
        data = {
            "tool_name": tool_name,
            "inputs": inputs,
            **(metadata or {})
        }
        self.log_event("tool_call", data)

    def log_tool_result(self,
                       tool_name: str,
                       result: Any,
                       metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Log a tool result.

        Args:
            tool_name: Name of the tool
            result: Tool result
            metadata: Additional metadata
        """
        data = {
            "tool_name": tool_name,
            "result": str(result),
            **(metadata or {})
        }
        self.log_event("tool_result", data)

    def log_llm_call(self,
                    model: str,
                    prompt: Union[str, List[Dict[str, str]]],
                    metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Log an LLM call.

        Args:
            model: Name of the model
            prompt: Prompt text or messages
            metadata: Additional metadata
        """
        # Convert prompt to string if it's a list of messages
        prompt_str = prompt if isinstance(prompt, str) else str(prompt)

        data = {
            "model": model,
            "prompt": prompt_str,
            **(metadata or {})
        }
        self.log_event("llm_call", data)

    def log_llm_response(self,
                        model: str,
                        response: str,
                        metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Log an LLM response.

        Args:
            model: Name of the model
            response: LLM response text
            metadata: Additional metadata
        """
        data = {
            "model": model,
            "response": response,
            **(metadata or {})
        }
        self.log_event("llm_response", data)
