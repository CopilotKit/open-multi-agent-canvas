"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCoAgent } from "@copilotkit/react-core";

import { TravelAgent } from "@/components/agents/travel";
import { AvailableAgents } from "@/lib/available-agents";

export default function TravelPage() {
  const router = useRouter();
  
  // Get agent state
  const { running, start } = useCoAgent({
    name: AvailableAgents.TRAVEL_AGENT,
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
        <TravelAgent />
      </div>
    </div>
  );
}
