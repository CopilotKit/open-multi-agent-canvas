# Dynamic Agent Factory with modular backends
import os
import logging
from typing import Optional, Dict, Any, Union, Literal
from mcp_agent.integrations.mem0_integration import Mem0MemoryManager
from mcp_agent.integrations.memorysaver_manager import MemorySaverManager
from mcp_agent.integrations.litellm_integration import LiteLLMWrapper
from mcp_agent.integrations.a2a_integration import A2ACommunicator
from mcp_agent.integrations.graphiti_integration import GraphitiKnowledgeSource
from mcp_agent.integrations.logfire_integration import LogfireLogger

from mcp_agent.integrations.base_memory import BaseMemoryManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentFactory:
    """
    Factory for creating agents with modular, configurable backends.
    Reads config/env to select memory, LLM, A2A, and knowledge backends.
    """
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or self._load_config_from_env()
        self.memory_backend = self.config.get("MEMORY_BACKEND", "memorysaver").lower()
        self.llm_backend = self.config.get("LLM_BACKEND", "litellm").lower()
        self.a2a_backend = self.config.get("A2A_BACKEND", "inmemory").lower()
        self.knowledge_backend = self.config.get("KNOWLEDGE_BACKEND", "graphiti").lower()
        self.logging_enabled = self.config.get("LOGGING_ENABLED", "true").lower() == "true"
        self.logfire_project = self.config.get("LOGFIRE_PROJECT", "kb-multi-agent")

        # Initialize logger
        self.logger = self._initialize_logger()

    def _load_config_from_env(self) -> Dict[str, Any]:
        """Load backend config from environment variables."""
        return {
            "MEMORY_BACKEND": os.getenv("MEMORY_BACKEND", "memorysaver"),
            "LLM_BACKEND": os.getenv("LLM_BACKEND", "litellm"),
            "A2A_BACKEND": os.getenv("A2A_BACKEND", "inmemory"),
            "KNOWLEDGE_BACKEND": os.getenv("KNOWLEDGE_BACKEND", "graphiti"),
            "DATABASE_BACKEND": os.getenv("DATABASE_BACKEND", "postgres"),
            "LOGGING_ENABLED": os.getenv("LOGGING_ENABLED", "true"),
            "LOGFIRE_PROJECT": os.getenv("LOGFIRE_PROJECT", "kb-multi-agent"),
            "SUPABASE_URL": os.getenv("SUPABASE_URL", ""),
            "SUPABASE_SERVICE_KEY": os.getenv("SUPABASE_SERVICE_KEY", ""),
        }

    def _initialize_logger(self) -> LogfireLogger:
        """Initialize the Logfire logger."""
        try:
            return LogfireLogger(
                project_name=self.logfire_project,
                enabled=self.logging_enabled
            )
        except Exception as e:
            logger.warning(f"Failed to initialize Logfire logger: {e}")
            # Return a disabled logger as fallback
            return LogfireLogger(enabled=False)

    def get_memory_manager(self) -> BaseMemoryManager:
        if self.memory_backend == "mem0":
            return Mem0MemoryManager()
        elif self.memory_backend == "memorysaver":
            return MemorySaverManager()
        else:
            raise ValueError(f"Unknown memory backend: {self.memory_backend}")

    def get_llm_client(self) -> LiteLLMWrapper:
        # Only LiteLLM implemented for now
        if self.llm_backend == "litellm":
            return LiteLLMWrapper()
        else:
            raise ValueError(f"Unknown LLM backend: {self.llm_backend}")

    def get_a2a_communicator(self) -> A2ACommunicator:
        # Only in-memory implemented for now
        if self.a2a_backend == "inmemory":
            return A2ACommunicator()
        else:
            raise ValueError(f"Unknown A2A backend: {self.a2a_backend}")

    def get_knowledge_source(self):
        """Get the configured knowledge source based on KNOWLEDGE_BACKEND setting"""
        if self.knowledge_backend == "graphiti":
            return GraphitiKnowledgeSource()
        else:
            return None

    def get_logger(self) -> LogfireLogger:
        """Get the configured logger"""
        return self.logger

    def create_agent(self, agent_class, **kwargs):
        """
        Instantiate an agent with the selected backends injected.
        agent_class: the class of the agent to instantiate.
        kwargs: any additional arguments for the agent.
        """
        memory = self.get_memory_manager()
        llm = self.get_llm_client()
        a2a = self.get_a2a_communicator()
        knowledge = self.get_knowledge_source()
        logger = self.get_logger()

        # Log agent creation
        agent_id = kwargs.get("agent_id", "unknown")
        logger.log_event("agent_created", {
            "agent_id": agent_id,
            "agent_class": agent_class.__name__,
            "memory_backend": self.memory_backend,
            "llm_backend": self.llm_backend,
            "a2a_backend": self.a2a_backend,
            "knowledge_backend": self.knowledge_backend
        })

        return agent_class(
            memory=memory,
            llm=llm,
            a2a=a2a,
            knowledge=knowledge,
            logger=logger,
            **kwargs
        )

# Example usage:
# factory = AgentFactory()
# my_agent = factory.create_agent(MyAgentClass, agent_id="agent-123")