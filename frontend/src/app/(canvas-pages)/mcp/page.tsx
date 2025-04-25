"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCoAgent } from "@copilotkit/react-core";

import { MCPAgent } from "@/components/agents/mcp-agent";
import { AvailableAgents } from "@/lib/available-agents";

export default function MCPPage() {
  const router = useRouter();
  
  // Get agent state
  const { running, start } = useCoAgent({
    name: AvailableAgents.MCP_AGENT,
  });

  // Start the agent if it's not already running
  useEffect(() => {
    if (!running) {
      start();
    }
  }, [running, start]);

  return (
    <div className="container mx-auto p-4 h-screen">
      <div className="h-full">
        <MCPAgent />
      </div>
    </div>
  );
}
