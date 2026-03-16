"use client";

import React from "react";

import { Github, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Multi-Agent Canvas Help</DialogTitle>
          <DialogDescription>
            Get help with using the Multi-Agent Canvas application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Getting Started</h3>
            <p className="text-sm text-muted-foreground">
              Multi-Agent Canvas allows you to interact with multiple specialized AI agents in a single interface.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Available Agents</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li><strong>Travel Agent:</strong> Plan trips and create itineraries</li>
              <li><strong>Research Agent:</strong> Conduct research with real-time progress</li>
              <li><strong>MCP Agent:</strong> Connect to custom MCP servers for specialized tasks</li>
              <li><strong>Knowledge Agent:</strong> Visualize and query knowledge graphs</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Use the sidebar to access settings and configure MCP servers.
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/CopilotKit/CopilotKit" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://docs.copilotkit.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                <span>Documentation</span>
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
