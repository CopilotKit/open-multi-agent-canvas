import type { FC} from "react";
import React, { useState, useEffect, useRef } from "react";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { CheckCircleIcon, Server } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components as _Components } from "react-markdown";

// Define a type for the code component props
type CodeProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};


import { useLocalStorage } from "@/hooks/use-local-storage";
import { AvailableAgents } from "@/lib/available-agents";
import { MCP_STORAGE_KEY } from "@/lib/mcp-config-types";
import type { ServerConfig} from "@/lib/mcp-config-types";


export type MCPAgentState = {
  response: string;
  logs: Array<{
    message: string;
    done: boolean;
  }>;
  mcp_config?: Record<string, ServerConfig>;
};

export const MCPAgent: FC = () => {
  const [logs, setLogs] = useState<
    Array<{
      message: string;
      done: boolean;
    }>
  >([]);

  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const isProcessing = useRef(false);

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

  // Check backend connection status
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const backendUrl = (configsRef.current["mcp-agent"] as SSEConfig)?.url || "http://localhost:8123";
        const response = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          setBackendStatus('connected');
          setLogs(prev => [...prev, { message: "Connected to MCP Agent backend", done: true }]);
        } else {
          setBackendStatus('disconnected');
          setLogs(prev => [...prev, { message: "Failed to connect to MCP Agent backend", done: true }]);
        }
      } catch (error) {
        setBackendStatus('disconnected');
        setLogs(prev => [...prev, { message: "Cannot reach MCP Agent backend", done: true }]);
      }
    };

    checkBackendStatus();
  }, []);

  const { state: mcpAgentState, stop: stopMcpAgent } = useCoAgent<MCPAgentState>({
    name: AvailableAgents.MCP_AGENT,
    initialState: {
      response: "",
      logs: [],
      mcp_config: configsRef.current,
    },
  });

  useEffect(() => {
    if (mcpAgentState.logs) {
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs];
        mcpAgentState.logs.forEach((log) => {
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
  }, [mcpAgentState.logs]);

  useCoAgentStateRender({
    name: AvailableAgents.MCP_AGENT,
    handler: ({ nodeName }) => {
      if (nodeName === "__end__") {
        setTimeout(() => {
          stopMcpAgent();
        }, 1000);
      }
    },
    render: ({ status }) => {
      if (status === "inProgress") {
        isProcessing.current = true;
        return (
          <div className="p-6 bg-card rounded-lg border border-border shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-mcp))]/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-[hsl(var(--agent-mcp))]" />
              </div>
              <h3 className="text-lg font-semibold">Processing your request...</h3>
            </div>
            <div className="mb-4 w-full">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(var(--agent-mcp))] rounded-full animate-progress w-1/3"></div>
              </div>
            </div>
            <ul className="space-y-3 mt-6">
              {logs.map((log, idx) => (
                <li key={idx} className="flex items-start p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className={`mr-3 flex-shrink-0 ${log.done ? "text-[hsl(var(--agent-mcp))]" : "text-muted-foreground animate-spin-slow"}`}>
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
              <div className="flex items-center gap-2 text-[hsl(var(--agent-mcp))] mb-4 p-2 bg-[hsl(var(--agent-mcp))]/10 rounded-md">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">Processing complete</span>
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
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-mcp))]/10 flex items-center justify-center">
              <Server className="h-5 w-5 text-[hsl(var(--agent-mcp))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">MCP Agent</h3>
              <p className="text-sm text-muted-foreground">Processing your request...</p>
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
              <div className="h-full bg-[hsl(var(--agent-mcp))] rounded-full animate-progress w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mcpAgentState.response) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 h-full z-[999] animate-fade-in">
      <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-mcp))]/10 flex items-center justify-center">
            <Server className="h-5 w-5 text-[hsl(var(--agent-mcp))]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">MCP Agent Response</h3>
            <p className="text-sm text-muted-foreground">Multi-purpose Computing Platform</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${backendStatus === 'connected' ? 'bg-green-100 text-green-800' : backendStatus === 'checking' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
            {backendStatus === 'connected' ? 'Backend Connected' : backendStatus === 'checking' ? 'Checking Connection...' : 'Backend Disconnected'}
          </div>
        </div>

        <ReactMarkdown
          className="prose prose-sm md:prose-base lg:prose-lg max-w-none bg-background p-6 rounded-lg border border-border animate-fade-in-up"
          components={{
            // Type the components object properly
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold mb-6 pb-2 border-b border-border">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold mb-4 mt-8">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-bold mb-3 mt-6">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[hsl(var(--agent-mcp))]/30 pl-4 py-2 my-6 bg-[hsl(var(--agent-mcp))]/5 rounded-r">
                {children}
              </blockquote>
            ),
            code: ({ inline, children, ...props }: CodeProps) => {
              if (inline) {
                return (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <div className="bg-muted/50 rounded-md p-1 my-4">
                  <div className="flex items-center justify-between px-4 py-1 border-b border-border">
                    <div className="text-xs text-muted-foreground">Code</div>
                  </div>
                  <pre className="p-4 overflow-x-auto">
                    <code className="text-sm font-mono" {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },
          }}
        >
          {mcpAgentState.response}
        </ReactMarkdown>
      </div>
    </div>
  );
};
