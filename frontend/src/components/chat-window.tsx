"use client";

import type { FC } from "react";

import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import {
  ActivityIcon,
  Loader2,
  RotateCw,
  SendIcon,
  Square,
} from "lucide-react";

export const ChatWindow: FC = () => {
  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden border border-border shadow-md">
      <div className="bg-card p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))] animate-pulse-subtle"></div>
          <h3 className="font-medium text-sm">Multi-Agent Chat</h3>
        </div>
        <div className="flex items-center space-x-1">
          <div className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Online</div>
        </div>
      </div>

      <CopilotChat
        className="h-full flex flex-col"
        instructions="Always use the MCP Agent if you need to use the MCP Servers. You are a multi-agent chat system with specialized agents:
          - MCP Agent: For general or multipurpose tasks use the mcp-agent
          - Travel Agent: Expert in planning trips, itineraries and travel recommendations
          - Research Agent: You are a helpful research assistant, set to help the user with conduction and writing a research paper on any topic
          - Knowledge Agent: Specialized in knowledge graph operations, allowing you to visualize, query, and manage structured knowledge"

        labels={{
          placeholder: "Type your message here...",
          regenerateResponse: "Try another response",
        }}
        icons={{
          sendIcon: (
            <SendIcon className="w-4 h-4 hover:scale-110 transition-transform" />
          ),
          activityIcon: <ActivityIcon className="w-4 h-4 animate-pulse" />,
          spinnerIcon: <Loader2 className="w-4 h-4 animate-spin" />,
          stopIcon: (
            <Square className="w-4 h-4 hover:text-red-500 transition-colors" />
          ),
          regenerateIcon: (
            <RotateCw className="w-4 h-4 hover:rotate-180 transition-transform duration-300" />
          ),
        }}
      />
    </div>
  );
};
