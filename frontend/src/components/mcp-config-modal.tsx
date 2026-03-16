"use client";

import { useState, useEffect, useRef } from "react";

import { useCoAgent } from "@copilotkit/react-core";
import { X, Plus, Server, Globe, Trash2 } from "lucide-react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { AvailableAgents } from "@/lib/available-agents";
import type { ConnectionType, ServerConfig} from "@/lib/mcp-config-types";
import { MCP_STORAGE_KEY } from "@/lib/mcp-config-types";

// External link icon component
function ExternalLink() {
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-3 h-3 ml-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
}

interface MCPConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MCPConfigModal({ isOpen, onClose }: MCPConfigModalProps) {
  // Use ref to avoid re-rendering issues
  const configsRef = useRef<Record<string, ServerConfig>>({});

  // Use localStorage hook for persistent storage
  const [savedConfigs, setSavedConfigs] = useLocalStorage<
    Record<string, ServerConfig>
  >(MCP_STORAGE_KEY, {});

  // Set the ref value once we have the saved configs
  useEffect(() => {
    if (Object.keys(savedConfigs).length > 0) {
      configsRef.current = savedConfigs;
    }
  }, [savedConfigs]);

  // Initialize agent state with the data from localStorage
  const { state: agentState, setState: setAgentState } = useCoAgent<{
    mcp_config: Record<string, ServerConfig>;
    response: string;
    logs: Array<{ message: string; done: boolean }>;
  }>({
    name: AvailableAgents.MCP_AGENT,
    initialState: {
      mcp_config: configsRef.current,
      response: "",
      logs: [],
    },
  });

  // Simple getter for configs
  const configs = agentState?.mcp_config || {};

  // Simple setter wrapper for configs
  const setConfigs = (newConfigs: Record<string, ServerConfig>) => {
    setAgentState((prevState) => ({
      ...prevState!,
      mcp_config: newConfigs,
    }));
    setSavedConfigs(newConfigs);
    configsRef.current = newConfigs;
  };

  const [serverName, setServerName] = useState("");
  const [connectionType, setConnectionType] = useState<ConnectionType>("stdio");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddServerForm, setShowAddServerForm] = useState(false);

  // Calculate server statistics
  const totalServers = Object.keys(configs).length;
  const stdioServers = Object.values(configs).filter(
    (config) => config.transport === "stdio"
  ).length;
  const sseServers = Object.values(configs).filter(
    (config) => config.transport === "sse"
  ).length;

  // Set loading to false when state is loaded
  useEffect(() => {
    if (agentState) {
      setIsLoading(false);
    }
  }, [agentState]);

  const addConfig = () => {
    if (!serverName) return;

    const newConfig =
      connectionType === "stdio"
        ? {
            command,
            args: args.split(" ").filter((arg) => arg.trim() !== ""),
            transport: "stdio" as const,
          }
        : {
            url,
            transport: "sse" as const,
          };

    setConfigs({
      ...configs,
      [serverName]: newConfig,
    });

    // Reset form
    setServerName("");
    setCommand("");
    setArgs("");
    setUrl("");
    setShowAddServerForm(false);
  };

  const removeConfig = (name: string) => {
    const newConfigs = { ...configs };
    delete newConfigs[name];
    setConfigs(newConfigs);
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-[10000] shadow-xl border border-border">
          <div className="p-4 flex items-center justify-center">
            <div className="animate-spin mr-2 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
            <span>Loading configuration...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-[10000] shadow-xl border border-border">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold">MCP Server Configuration</h1>
            </div>
            <button
              onClick={onClose}
              className="rounded-full h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
            <p className="text-sm text-muted-foreground">
              Manage and configure your MCP servers
            </p>
            <button
              onClick={() => setShowAddServerForm(true)}
              className="w-full sm:w-auto px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-1 justify-center transition-colors animate-fade-in"
            >
              <Plus className="h-4 w-4" />
              Add Server
            </button>
          </div>
        </div>

        {/* Server Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-md p-4 hover-lift transition-all-normal">
            <div className="text-sm text-muted-foreground">Total Servers</div>
            <div className="text-3xl font-bold mt-1">{totalServers}</div>
          </div>
          <div className="bg-card border border-border rounded-md p-4 hover-lift transition-all-normal">
            <div className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Stdio Servers</div>
            </div>
            <div className="text-3xl font-bold mt-1">{stdioServers}</div>
          </div>
          <div className="bg-card border border-border rounded-md p-4 hover-lift transition-all-normal">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">SSE Servers</div>
            </div>
            <div className="text-3xl font-bold mt-1">{sseServers}</div>
          </div>
        </div>

        {/* Server List */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Server List</h2>
            <div className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {totalServers} {totalServers === 1 ? 'server' : 'servers'}
            </div>
          </div>

          {totalServers === 0 ? (
            <div className="text-muted-foreground text-center py-10 border border-dashed border-border rounded-lg bg-muted/30">
              <div className="flex flex-col items-center gap-2">
                <Server className="w-8 h-8 text-muted-foreground/50" />
                <p>No servers configured</p>
                <button
                  onClick={() => setShowAddServerForm(true)}
                  className="mt-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium hover:bg-primary/20 flex items-center gap-1 justify-center transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Server
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(configs).map(([name, config]) => (
                <div
                  key={name}
                  className="border border-border rounded-lg overflow-hidden bg-background shadow-sm hover-lift transition-all-normal"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{name}</h3>
                        <div className="inline-flex items-center px-2 py-0.5 bg-muted text-xs rounded-full mt-1">
                          {config.transport === "stdio" ? (
                            <Server className="w-3 h-3 mr-1 text-primary" />
                          ) : (
                            <Globe className="w-3 h-3 mr-1 text-primary" />
                          )}
                          {config.transport}
                        </div>
                      </div>
                      <button
                        onClick={() => removeConfig(name)}
                        className="text-muted-foreground hover:text-destructive transition-colors rounded-full h-6 w-6 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {config.transport === "stdio" ? (
                        <>
                          <p className="flex items-center gap-1">
                            <span className="font-medium">Command:</span> {config.command}
                          </p>
                          <p className="truncate flex items-center gap-1">
                            <span className="font-medium">Args:</span> {config.args.join(" ")}
                          </p>
                        </>
                      ) : (
                        <p className="truncate flex items-center gap-1">
                          <span className="font-medium">URL:</span> {config.url}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reference */}
          <div className="mt-10 pt-4 border-t text-center text-sm text-muted-foreground">
            <div className="bg-muted/50 rounded-lg p-3 mt-4">
              <p className="mb-2">More MCP servers available on the web:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://mcp.composio.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full bg-background border border-border hover:bg-muted transition-colors"
                >
                  <Globe className="w-3 h-3 mr-1.5 text-primary" />
                  mcp.composio.dev
                  <ExternalLink />
                </a>
                <a
                  href="https://www.mcp.run/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full bg-background border border-border hover:bg-muted transition-colors"
                >
                  <Globe className="w-3 h-3 mr-1.5 text-primary" />
                  mcp.run
                  <ExternalLink />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Add Server Modal */}
        {showAddServerForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-background rounded-lg p-6 w-full max-w-md border border-border shadow-xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Add New Server</h2>
                </div>
                <button
                  onClick={() => setShowAddServerForm(false)}
                  className="rounded-full h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">
                    Server Name
                  </label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="e.g., api-service, data-processor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">
                    Connection Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConnectionType("stdio")}
                      className={`px-3 py-2 border rounded-md text-center flex items-center justify-center transition-colors ${
                        connectionType === "stdio"
                          ? "bg-primary/10 border-primary/30 text-primary font-medium"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Server className="w-4 h-4 mr-1.5" />
                      Standard IO
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectionType("sse")}
                      className={`px-3 py-2 border rounded-md text-center flex items-center justify-center transition-colors ${
                        connectionType === "sse"
                          ? "bg-primary/10 border-primary/30 text-primary font-medium"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Globe className="w-4 h-4 mr-1.5" />
                      SSE
                    </button>
                  </div>
                </div>

                {connectionType === "stdio" ? (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground">
                        Command
                      </label>
                      <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="e.g., python, node"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground">
                        Arguments
                      </label>
                      <input
                        type="text"
                        value={args}
                        onChange={(e) => setArgs(e.target.value)}
                        className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="e.g., path/to/script.py"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-1.5 text-foreground">URL</label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="e.g., http://localhost:8000/events"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 mt-2 border-t border-border">
                  <button
                    onClick={() => setShowAddServerForm(false)}
                    className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted text-sm font-medium flex items-center transition-colors"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel
                  </button>
                  <button
                    onClick={addConfig}
                    disabled={!serverName || (connectionType === "stdio" && !command) || (connectionType === "sse" && !url)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium flex items-center transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Server
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
