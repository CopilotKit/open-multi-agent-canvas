"use client";

import { useState, useEffect } from "react";
import { useCoAgent } from "@copilotkit/react-core";
import { AvailableAgents } from "@/lib/available-agents";
import { Clock, Activity, CheckCircle, XCircle, Server } from "lucide-react";

type AgentHistoryItem = {
  agentName: string;
  action: string;
  timestamp: number;
  success: boolean;
  details?: string;
};

type AgentState = {
  running: boolean;
  name: string;
  nodeName: string;
  lastActivity?: number;
};

export default function AgentMonitor() {
  const [agentHistory, setAgentHistory] = useState<AgentHistoryItem[]>([]);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({
    [AvailableAgents.TRAVEL_AGENT]: {
      running: false,
      name: "Travel Agent",
      nodeName: "",
    },
    [AvailableAgents.RESEARCH_AGENT]: {
      running: false,
      name: "Research Agent",
      nodeName: "",
    },
    [AvailableAgents.MCP_AGENT]: {
      running: false,
      name: "MCP Agent",
      nodeName: "",
    },
  });

  // Monitor travel agent state
  const { running: travelAgentRunning, name: travelAgentName, nodeName: travelAgentNodeName } = useCoAgent({
    name: AvailableAgents.TRAVEL_AGENT,
  });

  // Monitor AI research agent state
  const { running: aiResearchAgentRunning, name: aiResearchAgentName, nodeName: aiResearchAgentNodeName } = useCoAgent({
    name: AvailableAgents.RESEARCH_AGENT,
  });

  // Monitor MCP agent state
  const { running: mcpAgentRunning, name: mcpAgentName, nodeName: mcpAgentNodeName } = useCoAgent({
    name: AvailableAgents.MCP_AGENT,
  });

  // Update agent states when they change
  useEffect(() => {
    const newStates = {
      [AvailableAgents.TRAVEL_AGENT]: {
        running: travelAgentRunning,
        name: travelAgentName,
        nodeName: travelAgentNodeName || "",
        lastActivity: travelAgentRunning ? Date.now() : agentStates[AvailableAgents.TRAVEL_AGENT].lastActivity,
      },
      [AvailableAgents.RESEARCH_AGENT]: {
        running: aiResearchAgentRunning,
        name: aiResearchAgentName,
        nodeName: aiResearchAgentNodeName || "",
        lastActivity: aiResearchAgentRunning ? Date.now() : agentStates[AvailableAgents.RESEARCH_AGENT].lastActivity,
      },
      [AvailableAgents.MCP_AGENT]: {
        running: mcpAgentRunning,
        name: mcpAgentName,
        nodeName: mcpAgentNodeName || "",
        lastActivity: mcpAgentRunning ? Date.now() : agentStates[AvailableAgents.MCP_AGENT].lastActivity,
      },
    };

    // Check for state changes and add to history
    Object.entries(newStates).forEach(([agentKey, newState]) => {
      const oldState = agentStates[agentKey];
      
      if (newState.running !== oldState.running) {
        const action = newState.running ? "Started" : "Stopped";
        setAgentHistory(prev => [
          {
            agentName: newState.name,
            action,
            timestamp: Date.now(),
            success: true,
            details: newState.nodeName ? `Node: ${newState.nodeName}` : undefined,
          },
          ...prev,
        ]);
      } else if (newState.running && newState.nodeName !== oldState.nodeName && newState.nodeName) {
        setAgentHistory(prev => [
          {
            agentName: newState.name,
            action: "Changed Node",
            timestamp: Date.now(),
            success: true,
            details: `Node: ${newState.nodeName}`,
          },
          ...prev,
        ]);
      }
    });

    setAgentStates(newStates);
  }, [travelAgentRunning, travelAgentName, travelAgentNodeName, aiResearchAgentRunning, aiResearchAgentName, aiResearchAgentNodeName, mcpAgentRunning, mcpAgentName, mcpAgentNodeName, agentStates]);

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get agent status color
  const getStatusColor = (running: boolean) => {
    return running ? "text-green-500" : "text-gray-500";
  };

  // Get agent status icon
  const getStatusIcon = (running: boolean) => {
    return running ? (
      <Activity className="w-4 h-4 animate-pulse" />
    ) : (
      <Server className="w-4 h-4" />
    );
  };

  // Get history item icon
  const getHistoryIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Agent Monitor
        </h3>
      </div>

      {/* Agent States */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {Object.entries(agentStates).map(([agentKey, state]) => (
          <div key={agentKey} className="border rounded-md p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {getStatusIcon(state.running)}
                <span className="font-medium">{state.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(state.running)}`}>
                  {state.running ? "Running" : "Idle"}
                </span>
              </div>
              {state.running && state.nodeName && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  Node: {state.nodeName}
                </span>
              )}
            </div>
            {state.lastActivity && (
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                Last activity: {formatTime(state.lastActivity)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Agent History */}
      <div className="mt-6">
        <h4 className="font-medium mb-3 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Activity History
        </h4>
        <div className="border rounded-md max-h-60 overflow-y-auto">
          {agentHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No activity yet
            </div>
          ) : (
            <div className="divide-y">
              {agentHistory.slice(0, 20).map((item, index) => (
                <div key={index} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start gap-2">
                    {getHistoryIcon(item.success)}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.agentName}</span>
                        <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
                      </div>
                      <p className="text-sm">{item.action}</p>
                      {item.details && (
                        <p className="text-xs text-gray-600 mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
