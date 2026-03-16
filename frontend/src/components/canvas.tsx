"use client";

import { Suspense } from "react";

import { useCoAgent } from "@copilotkit/react-core";
import { Loader2 } from "lucide-react";
import Image from "next/image";

import * as Agents from "@/components/agents";
import * as Skeletons from "@/components/skeletons";
import { AvailableAgents } from "@/lib/available-agents";
import { cn } from "@/lib/utils";

import { ChatWindow } from "./chat-window";


const getCurrentlyRunningAgent = (
  state: Array<{
    status: boolean;
    name: string;
    nodeName: string;
  }>
) => {
  return state.find((agent) => agent.status);
};

function DefaultView() {
  return <div className="flex flex-col items-center justify-center h-full text-foreground animate-fade-in-up">
    <div className="relative w-32 h-32 mb-8 animate-float">
      <Image src="/logo.svg" alt="Multi-Agent Canvas" width={128} height={128} className="w-full h-full animate-glow" />
    </div>
    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[hsl(var(--agent-travel))] via-[hsl(var(--agent-research))] to-[hsl(var(--agent-knowledge))] bg-clip-text text-transparent animate-shimmer">
      Multi-Agent Canvas
    </h2>
    <p className="text-xl text-center max-w-md mb-8 text-muted-foreground">
      Start a conversation in the chat to activate one of our specialized agents:
    </p>
    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
      <div className="p-4 rounded-lg border border-border bg-background/50 hover-lift transition-all-normal">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-travel))] flex items-center justify-center text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <h3 className="font-semibold">Travel Agent</h3>
        </div>
        <p className="text-sm text-muted-foreground">Plan trips and explore destinations with interactive maps</p>
      </div>
      <div className="p-4 rounded-lg border border-border bg-background/50 hover-lift transition-all-normal">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-research))] flex items-center justify-center text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <h3 className="font-semibold">Research Agent</h3>
        </div>
        <p className="text-sm text-muted-foreground">Conduct in-depth research on any topic with detailed reports</p>
      </div>
      <div className="p-4 rounded-lg border border-border bg-background/50 hover-lift transition-all-normal">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-mcp))] flex items-center justify-center text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
          </div>
          <h3 className="font-semibold">MCP Agent</h3>
        </div>
        <p className="text-sm text-muted-foreground">Multi-purpose computing with configurable tools and servers</p>
      </div>
      <div className="p-4 rounded-lg border border-border bg-background/50 hover-lift transition-all-normal">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-knowledge))] flex items-center justify-center text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <h3 className="font-semibold">Knowledge Agent</h3>
        </div>
        <p className="text-sm text-muted-foreground">Build and query knowledge graphs with visual relationships</p>
      </div>
    </div>
    <p className="text-sm text-center mt-8 text-muted-foreground/70">
      Powered by CopilotKit 🪁
    </p>
  </div>
}

export default function Canvas() {
  const {
    running: travelAgentRunning,
    name: travelAgentName,
    nodeName: travelAgentNodeName,
  } = useCoAgent({
    name: AvailableAgents.TRAVEL_AGENT,
  });

  const {
    running: aiResearchAgentRunning,
    name: aiResearchAgentName,
    nodeName: aiResearchAgentNodeName,
  } = useCoAgent({
    name: AvailableAgents.RESEARCH_AGENT,
  });

  const {
    running: mcpAgentRunning,
    name: mcpAgentName,
    nodeName: mcpAgentNodeName,
  } = useCoAgent({
    name: AvailableAgents.MCP_AGENT,
  });

  const {
    running: knowledgeAgentRunning,
    name: knowledgeAgentName,
    nodeName: knowledgeAgentNodeName,
  } = useCoAgent({
    name: AvailableAgents.KNOWLEDGE_AGENT,
  });

  const currentlyRunningAgent = getCurrentlyRunningAgent([
    {
      status: travelAgentRunning,
      name: travelAgentName,
      nodeName: travelAgentNodeName ?? "",
    },
    {
      status: aiResearchAgentRunning,
      name: aiResearchAgentName,
      nodeName: aiResearchAgentNodeName ?? "",
    },
    {
      status: mcpAgentRunning,
      name: mcpAgentName,
      nodeName: mcpAgentNodeName ?? "",
    },
    {
      status: knowledgeAgentRunning,
      name: knowledgeAgentName,
      nodeName: knowledgeAgentNodeName ?? "",
    },
  ]);

  return (
    <div className="relative h-full w-full grid grid-cols-1 md:grid-cols-12">
      {currentlyRunningAgent?.status && (
        <div className="fixed top-4 right-4 bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-full shadow-lg animate-pulse-subtle z-[9999] animate-fade-in-down">
          <span className="font-bold">
            <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
            {currentlyRunningAgent.name} agent executing{" "}
            {currentlyRunningAgent.nodeName} node
          </span>{" "}
        </div>
      )}

      <div className={cn(
        "order-last md:order-first md:col-span-7 p-4 border-r h-screen overflow-y-auto",
        "transition-all-normal animate-fade-in"
      )}>
        <div className="animate-fade-in-up">
          <ChatWindow />
        </div>
      </div>

      <div className={cn(
        "order-first md:order-last md:col-span-5 bg-card p-4 overflow-y-auto h-screen",
        "transition-all-normal animate-fade-in rounded-l-xl shadow-md"
      )}>
        <div className="space-y-8 h-full">
          <Suspense fallback={<Skeletons.EmailListSkeleton />}>
            <div className="h-full animate-fade-in-up">
              {currentlyRunningAgent?.status && (
                <div className="animate-fade-in-up transition-all-normal">
                  {travelAgentRunning && <Agents.TravelAgent />}
                  {aiResearchAgentRunning && <Agents.AIResearchAgent />}
                  {mcpAgentRunning && <Agents.MCPAgent />}
                  {knowledgeAgentRunning && <Agents.KnowledgeAgent />}
                </div>
              )}
              {!currentlyRunningAgent?.status && <DefaultView />}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
