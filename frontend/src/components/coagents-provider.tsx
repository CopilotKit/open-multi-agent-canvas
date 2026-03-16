"use client";
import { createContext, useContext, useRef } from "react";
import { useCoAgent } from "@copilotkit/react-core";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AvailableAgents } from "@/lib/available-agents";
import type { ServerConfig } from "@/lib/mcp-config-types";
import { MCP_STORAGE_KEY } from "@/lib/mcp-config-types";
import type { KnowledgeAgentState } from "./agents/knowledge-agent";
import type { MCPAgentState } from "./agents/mcp-agent";
import type { ResearchAgentState } from "./agents/researcher";


/**
 * Base Agent State
 */
export type BaseAgentState = {
  __name__: AvailableAgents;
};

/**
 * Travel Agent Types
 */
export type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  description?: string;
};

export type Trip = {
  id: string;
  name: string;
  center_latitude: number;
  center_longitude: number;
  zoom_level?: number | 13;
  places: Place[];
};

export type SearchProgress = {
  query: string;
  done: boolean;
};

export type TravelAgentState = BaseAgentState & {
  trips: Trip[];
  selected_trip_id: string | null;
  search_progress?: SearchProgress[];
};

/**
 * Research Agent Types
 */
export interface Section {
  title: string;
  content: string;
  idx: number;
  footer?: string;
  id: string;
}

export interface Source {
  content: string;
  published_date: string;
  score: number;
  title: string;
  url: string;
}
export type Sources = Record<string, Source>;

export interface Log {
  message: string;
  done: boolean;
}

export const AgentsContext = createContext<
  Array<TravelAgentState | ResearchAgentState | MCPAgentState | KnowledgeAgentState>
>([]);

/**
 * This provider wraps state from all agents
 */
export function CoAgentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default backend configuration
  const defaultConfig: Record<string, ServerConfig> = {
    "mcp-agent": {
      url: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8123",
      transport: "sse"
    }
  };

  // Use ref to avoid re-rendering issues
  const configsRef = useRef<Record<string, ServerConfig>>(defaultConfig);

  // Get saved MCP configurations from localStorage
  const [savedConfigs] = useLocalStorage<Record<string, ServerConfig>>(MCP_STORAGE_KEY, defaultConfig);

  // Set the ref value once we have the saved configs
  if (Object.keys(savedConfigs).length > 0) {
    configsRef.current = savedConfigs;
  }

  const { state: travelAgentState } = useCoAgent({
    name: AvailableAgents.TRAVEL_AGENT,
  });

  const { state: aiResearchAgentState } = useCoAgent({
    name: AvailableAgents.RESEARCH_AGENT,
    initialState: {
      model: "openai",
      research_question: "",
      resources: [],
      report: "",
      logs: [],
    },
  });

  const { state: mcpAgentState } = useCoAgent({
    name: AvailableAgents.MCP_AGENT,
    initialState: {
      response: "",
      logs: [],
      mcp_config: configsRef.current,
    },
  });

  const { state: knowledgeAgentState } = useCoAgent({
    name: AvailableAgents.KNOWLEDGE_AGENT,
    initialState: {
      query: "",
      entities: [],
      relations: [],
      logs: [],
    },
  });

  return (
    <AgentsContext.Provider
      value={[
        {
          ...travelAgentState,
          __name__: AvailableAgents.TRAVEL_AGENT,
        },
        {
          ...aiResearchAgentState,
          __name__: AvailableAgents.RESEARCH_AGENT,
        },
        {
          ...mcpAgentState,
          __name__: AvailableAgents.MCP_AGENT,
        },
        {
          ...knowledgeAgentState,
          __name__: AvailableAgents.KNOWLEDGE_AGENT,
        },
      ]}
    >
      {children}
    </AgentsContext.Provider>
  );
}

export const useCoAgents = () => {
  const context = useContext(AgentsContext);
  if (!context) {
    throw new Error("useAgents must be used within an AgentsProvider");
  }
  return context;
};
