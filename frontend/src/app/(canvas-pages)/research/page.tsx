"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCoAgent } from "@copilotkit/react-core";

import { AIResearchAgent } from "@/components/agents/researcher";
import { AvailableAgents } from "@/lib/available-agents";

export default function ResearchPage() {
  const router = useRouter();
  
  // Get agent state
  const { running, start } = useCoAgent({
    name: AvailableAgents.RESEARCH_AGENT,
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
        <AIResearchAgent />
      </div>
    </div>
  );
}
