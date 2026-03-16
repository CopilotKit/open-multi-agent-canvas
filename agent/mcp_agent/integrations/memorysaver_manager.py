from typing import List, Dict, Any, Optional
from .base_memory import BaseMemoryManager

class MemorySaverManager(BaseMemoryManager):
    """
    Wraps the legacy MemorySaver to conform to the BaseMemoryManager protocol.
    Provides async, type-safe methods for agent memory operations.
    """
    def __init__(self, storage_path: Optional[str] = None):
        try:
            from langgraph.checkpoint.memory import MemorySaver
        except ImportError as e:
            raise ImportError(f"MemorySaver could not be imported: {e}")
        # Use a file path or in-memory by default
        self.saver = MemorySaver(storage_path) if storage_path else MemorySaver()

    async def add_memory(self, user_id: str, content: Optional[str] = None, messages: Optional[List[Dict[str, str]]] = None, metadata: Optional[dict] = None) -> Any:
        """
        Adds a memory for a user. MemorySaver expects a dict, so we store as a dict with user_id and content/messages.
        """
        memory = {"user_id": user_id}
        if content:
            memory["content"] = content
        if messages:
            memory["messages"] = messages
        if metadata:
            memory["metadata"] = metadata
        # MemorySaver is sync, so just call it directly
        return self.saver.save(memory)

    async def search_memory(self, user_id: str, query: str, limit: int = 5, filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """
        Searches for memories for a user. MemorySaver does not support semantic search, so we filter by user_id and query in content/messages.
        """
        all_memories = self.saver.load()
        results = []
        for mem in all_memories:
            if mem.get("user_id") != user_id:
                continue
            if query:
                if (query in str(mem.get("content", ""))) or any(query in str(m.get("content", "")) for m in mem.get("messages", [])):
                    results.append(mem)
            else:
                results.append(mem)
            if len(results) >= limit:
                break
        return results

    async def get_all_memories(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Returns all memories for a user.
        """
        all_memories = self.saver.load()
        return [mem for mem in all_memories if mem.get("user_id") == user_id]

    async def get_memory(self, memory_id: str) -> Optional[Dict[str, Any]]:
        """
        Returns a memory by its id. MemorySaver does not natively support ids, so we treat the index as id.
        """
        all_memories = self.saver.load()
        try:
            idx = int(memory_id)
            return all_memories[idx]
        except (ValueError, IndexError):
            return None

    async def update_memory(self, memory_id: str, data: Dict[str, Any]) -> Any:
        """
        Updates a memory by its id (index). Overwrites the memory at the given index.
        """
        all_memories = self.saver.load()
        try:
            idx = int(memory_id)
            all_memories[idx].update(data)
            self.saver.save_all(all_memories)
            return all_memories[idx]
        except (ValueError, IndexError):
            return None

    async def delete_memory(self, memory_id: str) -> Any:
        """
        Deletes a memory by its id (index).
        """
        all_memories = self.saver.load()
        try:
            idx = int(memory_id)
            deleted = all_memories.pop(idx)
            self.saver.save_all(all_memories)
            return deleted
        except (ValueError, IndexError):
            return None 