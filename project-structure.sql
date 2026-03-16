-- Create tables for project structure
CREATE TABLE components (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    description TEXT
);

CREATE TABLE relationships (
    id INTEGER PRIMARY KEY,
    source_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    relationship_type VARCHAR NOT NULL,
    FOREIGN KEY (source_id) REFERENCES components(id),
    FOREIGN KEY (target_id) REFERENCES components(id)
);

CREATE TABLE files (
    id INTEGER PRIMARY KEY,
    path VARCHAR NOT NULL,
    component_id INTEGER,
    file_type VARCHAR,
    description TEXT,
    FOREIGN KEY (component_id) REFERENCES components(id)
);

-- Insert components
INSERT INTO components VALUES
(1, 'KB-multi-agent', 'Project', 'Main project repository containing both frontend and backend components'),
(2, 'Frontend', 'Component', 'Next.js 15.1.6 with React 19, TanStack Query, and CopilotKit'),
(3, 'Backend', 'Component', 'LangGraph and FastAPI with modular architecture'),
(4, 'TravelAgent', 'Agent', 'Specialized agent for travel planning'),
(5, 'ResearchAgent', 'Agent', 'Specialized agent for conducting research'),
(6, 'MCPAgent', 'Agent', 'General-purpose agent using MCP servers'),
(7, 'KnowledgeAgent', 'Agent', 'Specialized agent for knowledge graph visualization'),
(8, 'LangGraph', 'Technology', 'Framework for building stateful, multi-actor applications with LLMs'),
(9, 'CopilotKit', 'Technology', 'Framework for building AI copilots'),
(10, 'AgentFactory', 'Component', 'Factory for creating agents with modular backends');

-- Insert relationships
INSERT INTO relationships VALUES
(1, 1, 2, 'contains'),
(2, 1, 3, 'contains'),
(3, 2, 9, 'uses'),
(4, 3, 8, 'uses'),
(5, 2, 3, 'communicates with'),
(6, 2, 4, 'implements'),
(7, 2, 5, 'implements'),
(8, 2, 6, 'implements'),
(9, 2, 7, 'implements'),
(10, 3, 10, 'uses'),
(11, 10, 6, 'creates'),
(12, 10, 7, 'creates');

-- Insert key files
INSERT INTO files VALUES
(1, 'frontend/src/components/agents/travel-agent.tsx', 4, 'TypeScript', 'Travel agent implementation'),
(2, 'frontend/src/components/agents/researcher.tsx', 5, 'TypeScript', 'Research agent implementation'),
(3, 'frontend/src/components/agents/mcp-agent.tsx', 6, 'TypeScript', 'MCP agent implementation'),
(4, 'frontend/src/components/agents/knowledge-agent.tsx', 7, 'TypeScript', 'Knowledge agent implementation'),
(5, 'agent/mcp_agent/agent.py', 3, 'Python', 'Main agent workflow definition'),
(6, 'agent/mcp_agent/agent_factory.py', 10, 'Python', 'Agent factory implementation'),
(7, 'agent/mcp_agent/custom_server.py', 3, 'Python', 'Custom server implementation'),
(8, 'frontend/src/components/coagents-provider.tsx', 2, 'TypeScript', 'Provider for agent state management'),
(9, 'frontend/src/components/enhanced-layout.tsx', 2, 'TypeScript', 'Main layout component'),
(10, 'frontend/src/components/enhanced-sidebar.tsx', 2, 'TypeScript', 'Sidebar navigation component'),
(11, 'agent/mcp_agent/langgraph.json', 3, 'JSON', 'LangGraph configuration'),
(12, 'agent/knowledge_server.py', 7, 'Python', 'Knowledge server implementation'),
(13, 'agent/math_server.py', 6, 'Python', 'Math server implementation'),
(14, 'start-all.ps1', 1, 'PowerShell', 'Script to start both frontend and backend'),
(15, 'frontend/next.config.ts', 2, 'TypeScript', 'Next.js configuration');

-- Query to view project structure
-- SELECT c.name, c.type, r.relationship_type, c2.name as related_to
-- FROM components c
-- LEFT JOIN relationships r ON c.id = r.source_id
-- LEFT JOIN components c2 ON r.target_id = c2.id
-- ORDER BY c.id, r.id;

-- Query to view files by component
-- SELECT c.name as component, f.path, f.file_type, f.description
-- FROM files f
-- JOIN components c ON f.component_id = c.id
-- ORDER BY c.id, f.id;
