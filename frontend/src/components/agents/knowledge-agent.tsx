import type { FC} from "react";
import React, { useState, useEffect, useRef } from "react";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { CheckCircleIcon, Network } from "lucide-react";

import { KnowledgeGraph } from "@/components/knowledge-graph";
import { AvailableAgents } from "@/lib/available-agents";


export type KnowledgeAgentState = {
  query: string;
  entities: Array<{
    id: string;
    name: string;
    type: string;
    properties: Record<string, unknown>;
  }>;
  relations: Array<{
    source_id: string;
    target_id: string;
    type: string;
    properties?: Record<string, unknown>;
  }>;
  logs: Array<{
    message: string;
    done: boolean;
  }>;
};

export const KnowledgeAgent: FC = () => {
  const [logs, setLogs] = useState<
    Array<{
      message: string;
      done: boolean;
    }>
  >([]);

  const isProcessing = useRef(false);

  const { state: knowledgeAgentState, stop: stopKnowledgeAgent } = useCoAgent<KnowledgeAgentState>({
    name: AvailableAgents.KNOWLEDGE_AGENT,
    initialState: {
      query: "",
      entities: [],
      relations: [],
      logs: [],
    },
  });

  useEffect(() => {
    if (knowledgeAgentState.logs) {
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs];
        knowledgeAgentState.logs.forEach((log) => {
          const existingLogIndex = newLogs.findIndex(
            (l) => l.message === log.message
          );
          if (existingLogIndex >= 0) {
            if (log.done && !newLogs[existingLogIndex].done) {
              newLogs[existingLogIndex].done = true;
            }
          } else {
            newLogs.push(log);
          }
        });
        return newLogs;
      });
    }
  }, [knowledgeAgentState.logs]);

  useCoAgentStateRender({
    name: AvailableAgents.KNOWLEDGE_AGENT,
    handler: ({ nodeName }) => {
      if (nodeName === "__end__") {
        setTimeout(() => {
          stopKnowledgeAgent();
        }, 1000);
      }
    },
    render: ({ status }) => {
      if (status === "inProgress") {
        isProcessing.current = true;
        return (
          <div className="p-6 bg-card rounded-lg border border-border shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-knowledge))]/10 flex items-center justify-center">
                <Network className="h-5 w-5 text-[hsl(var(--agent-knowledge))]" />
              </div>
              <h3 className="text-lg font-semibold">Processing knowledge query...</h3>
            </div>
            <div className="mb-4 w-full">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(var(--agent-knowledge))] rounded-full animate-progress w-1/3"></div>
              </div>
            </div>
            <ul className="space-y-3 mt-6">
              {logs.map((log, idx) => (
                <li key={idx} className="flex items-start p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className={`mr-3 flex-shrink-0 ${log.done ? "text-[hsl(var(--agent-knowledge))]" : "text-muted-foreground animate-spin-slow"}`}>
                    {log.done ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    )}
                  </span>
                  <span className={log.done ? "" : "text-muted-foreground"}>{log.message}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      if (status === "complete") {
        isProcessing.current = false;
        return (
          <div className="animate-fade-in">
            <div className="prose max-w-none">
              <div className="flex items-center gap-2 text-[hsl(var(--agent-knowledge))] mb-4 p-2 bg-[hsl(var(--agent-knowledge))]/10 rounded-md">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">Knowledge query complete</span>
              </div>
            </div>
          </div>
        );
      }
    },
  });

  if (isProcessing.current) {
    return (
      <div className="flex flex-col gap-4 h-full z-[999]">
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-knowledge))]/10 flex items-center justify-center">
              <Network className="h-5 w-5 text-[hsl(var(--agent-knowledge))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Knowledge Graph</h3>
              <p className="text-sm text-muted-foreground">Building knowledge representation...</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-6 bg-muted rounded-md animate-pulse-subtle"></div>
            <div className="h-4 bg-muted rounded-md w-5/6 animate-pulse-subtle"></div>
            <div className="h-4 bg-muted rounded-md w-full animate-pulse-subtle"></div>
            <div className="h-4 bg-muted rounded-md w-4/6 animate-pulse-subtle"></div>
          </div>

          <div className="mt-6 w-full">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[hsl(var(--agent-knowledge))] rounded-full animate-progress w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full z-[999] animate-fade-in">
      <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border border-border shadow-sm h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-knowledge))]/10 flex items-center justify-center">
            <Network className="h-5 w-5 text-[hsl(var(--agent-knowledge))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Knowledge Graph</h3>
            <p className="text-sm text-muted-foreground">
              {knowledgeAgentState.entities.length} entities, {knowledgeAgentState.relations.length} relations
            </p>
          </div>
        </div>
        <div className="animate-fade-in-up h-full overflow-y-auto">
          <KnowledgeGraph />
        </div>
      </div>
    </div>
  );
};
