from typing import Protocol, Any, List, Dict, Optional

class BaseMemoryManager(Protocol):
    """
    Protocol for semantic memory backends. All memory managers must implement these methods.
    """
    async def add_memory(self, user_id: str, content: Optional[str] = None, messages: Optional[List[Dict[str, str]]] = None, metadata: Optional[dict] = None) -> Any:
        ...

    async def search_memory(self, user_id: str, query: str, limit: int = 5, filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
        ...

    async def get_all_memories(self, user_id: str) -> List[Dict[str, Any]]:
        ...

    async def get_memory(self, memory_id: str) -> Optional[Dict[str, Any]]:
        ...

    async def update_memory(self, memory_id: str, data: Dict[str, Any]) -> Any:
        ...

    async def delete_memory(self, memory_id: str) -> Any:
        ... 