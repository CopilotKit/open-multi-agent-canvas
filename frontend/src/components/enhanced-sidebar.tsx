"use client";

import type { ReactNode } from "react";
import React, { useState, useEffect } from "react";

import { useCoAgent } from "@copilotkit/react-core";
import {
  MapPin,
  BookOpen,
  Server,
  Network,
  Settings,
  Moon,
  Sun,
  Menu,
  Home,
  MessageSquare,
  Github,
  HelpCircle,
  Users,
  Brain,
  GitBranch,
  Workflow
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";


import { HelpModal } from "@/components/help-modal";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
  useSidebar
} from "@/components/ui/sidebar";
import { AvailableAgents } from "@/lib/available-agents";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

// Custom SidebarMenuItem that accepts icon and isActive props
interface EnhancedSidebarMenuItemProps {
  icon?: ReactNode;
  isActive?: boolean;
  className?: string;
  children: ReactNode;
}

function EnhancedSidebarMenuItem({ icon, isActive, className, children }: EnhancedSidebarMenuItemProps) {
  return (
    <SidebarMenuItem className={className}>
      <div className="flex items-center gap-2 w-full">
        {icon && <span className={isActive ? "text-sidebar-accent-foreground" : ""}>{icon}</span>}
        {children}
      </div>
    </SidebarMenuItem>
  );
}

export function EnhancedSidebar({
  onShowMCPConfigModal,
  onShowSettingsModal
}: {
  showMCPConfigModal?: boolean;
  showSettingsModal?: boolean;
  onShowMCPConfigModal: () => void;
  onShowSettingsModal: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const { setOpenMobile } = useSidebar();
  const [activeAgent, setActiveAgent] = useState<AvailableAgents | null>(null);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const mounted = useMounted();
  const pathname = usePathname();

  // Get agent running states
  const { running: travelAgentRunning } = useCoAgent({
    name: AvailableAgents.TRAVEL_AGENT,
  });

  const { running: researchAgentRunning } = useCoAgent({
    name: AvailableAgents.RESEARCH_AGENT,
  });

  const { running: mcpAgentRunning } = useCoAgent({
    name: AvailableAgents.MCP_AGENT,
  });

  const { running: knowledgeAgentRunning } = useCoAgent({
    name: AvailableAgents.KNOWLEDGE_AGENT,
  });

  // Update active agent based on running state
  useEffect(() => {
    if (travelAgentRunning) {
      setActiveAgent(AvailableAgents.TRAVEL_AGENT);
    } else if (researchAgentRunning) {
      setActiveAgent(AvailableAgents.RESEARCH_AGENT);
    } else if (mcpAgentRunning) {
      setActiveAgent(AvailableAgents.MCP_AGENT);
    } else if (knowledgeAgentRunning) {
      setActiveAgent(AvailableAgents.KNOWLEDGE_AGENT);
    } else {
      setActiveAgent(null);
    }
  }, [travelAgentRunning, researchAgentRunning, mcpAgentRunning, knowledgeAgentRunning]);

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Get agent color class
  const getAgentColorClass = (agent: AvailableAgents): string => {
    switch (agent) {
      case AvailableAgents.TRAVEL_AGENT:
        return "text-[hsl(var(--agent-travel))]";
      case AvailableAgents.RESEARCH_AGENT:
        return "text-[hsl(var(--agent-research))]";
      case AvailableAgents.MCP_AGENT:
        return "text-[hsl(var(--agent-mcp))]";
      case AvailableAgents.KNOWLEDGE_AGENT:
        return "text-[hsl(var(--agent-knowledge))]";
      default:
        return "text-sidebar-foreground";
    }
  };

  return (
    <div className="relative">
      {/* Mobile menu trigger */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background/80 backdrop-blur-sm hover-scale"
          onClick={() => setOpenMobile(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="border-r border-sidebar-border"
      >
        <SidebarHeader className="py-4">
          <div className="flex items-center justify-center gap-2 px-4">
            <div className="relative h-10 w-10 overflow-hidden rounded-full animate-float hover-glow">
              <Image
                src="/logo.svg"
                alt="Multi-Agent Canvas"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <h2 className="text-lg font-bold tracking-tight animate-fade-in">
              Multi-Agent Canvas
            </h2>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarMenu>
              <EnhancedSidebarMenuItem
                icon={<Home className="h-5 w-5" />}
                isActive={pathname === "/" && !activeAgent}
                className="transition-all-fast hover-scale"
              >
                <Link href="/" className="flex w-full">
                  Home
                </Link>
              </EnhancedSidebarMenuItem>

              <EnhancedSidebarMenuItem
                icon={<MessageSquare className="h-5 w-5" />}
                isActive={pathname === "/chat" || pathname.includes("/chat")}
                className="transition-all-fast hover-scale"
              >
                <Link href="/chat" className="flex w-full">
                  Chat
                </Link>
              </EnhancedSidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Agents Section */}
          <SidebarGroup>
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Agents
            </h3>
            <SidebarMenu>
              {/* Travel Agent */}
              <SidebarMenuItem
                className={cn(
                  "transition-all-fast hover-scale cursor-pointer",
                  (activeAgent === AvailableAgents.TRAVEL_AGENT || pathname === "/travel") && "text-[hsl(var(--agent-travel))]"
                )}
                // Cannot directly start/stop agents from sidebar
              >
                <Link href="/travel" className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "relative",
                      getAgentColorClass(AvailableAgents.TRAVEL_AGENT)
                    )}
                    onMouseEnter={() => setIsHovering(AvailableAgents.TRAVEL_AGENT)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    <MapPin className="h-5 w-5" />
                    {travelAgentRunning && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--agent-travel))] animate-pulse-subtle" />
                    )}
                    {isHovering === AvailableAgents.TRAVEL_AGENT && !travelAgentRunning && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--agent-travel))] opacity-0 animate-fade-in" />
                    )}
                  </div>
                  <span className="flex w-full items-center justify-between">
                    Travel Agent
                    {travelAgentRunning && (
                      <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-[hsl(var(--agent-travel))] animate-pulse-subtle" />
                    )}
                  </span>
                </Link>
              </SidebarMenuItem>

              {/* Research Agent */}
              <SidebarMenuItem
                className={cn(
                  "transition-all-fast hover-scale cursor-pointer",
                  (activeAgent === AvailableAgents.RESEARCH_AGENT || pathname === "/research") && "text-[hsl(var(--agent-research))]"
                )}
                // Cannot directly start/stop agents from sidebar
              >
                <Link href="/research" className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "relative",
                      getAgentColorClass(AvailableAgents.RESEARCH_AGENT)
                    )}
                    onMouseEnter={() => setIsHovering(AvailableAgents.RESEARCH_AGENT)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    <BookOpen className="h-5 w-5" />
                    {researchAgentRunning && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--agent-research))] animate-pulse-subtle" />
                    )}
                    {isHovering === AvailableAgents.RESEARCH_AGENT && !researchAgentRunning && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--agent-research))] opacity-0 animate-fade-in" />
                    )}
                  </div>
                  <span className="flex w-full items-center justify-between">
                    Research Agent
                    {researchAgentRunning && (
                      <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-[hsl(var(--agent-research))] animate-pulse-subtle" />
                    )}
                  </span>
                </Link>
              </SidebarMenuItem>

              {/* MCP Agent */}
              <SidebarMenuItem
                className={cn(
                  "transition-all-fast hover-scale cursor-pointer",
                  (activeAgent === AvailableAgents.MCP_AGENT || pathname === "/mcp") && "text-[hsl(var(--agent-mcp))]"
                )}
                // Cannot directly start/stop agents from sidebar
              >
                <Link href="/mcp" className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "relative",
                      getAgentColorClass(AvailableAgents.MCP_AGENT)
                    )}
                    onMouseEnter={() => setIsHovering(AvailableAgents.MCP_AGENT)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    <Server className="h-5 w-5" />
                    {mcpAgentRunning && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--agent-mcp))] animate-pulse-subtle" />
                    )}
                    {isHovering === AvailableAgents.MCP_AGENT && !mcpAgentRunning && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--agent-mcp))] opacity-0 animate-fade-in" />
                    )}
                  </div>
                  <span className="flex w-full items-center justify-between">
                    MCP Agent
                    {mcpAgentRunning && (
                      <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-[hsl(var(--agent-mcp))] animate-pulse-subtle" />
                    )}
                  </span>
                </Link>
              </SidebarMenuItem>

              {/* Knowledge Agent */}
              <SidebarMenuItem
                className={cn(
                  "transition-all-fast hover-scale cursor-pointer",
                  (activeAgent === AvailableAgents.KNOWLEDGE_AGENT || pathname === "/knowledge") && "text-[hsl(var(--agent-knowledge))]"
                )}
                // Cannot directly start/stop agents from sidebar
              >
                <Link href="/knowledge" className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "relative",
                      getAgentColorClass(AvailableAgents.KNOWLEDGE_AGENT)
                    )}
                    onMouseEnter={() => setIsHovering(AvailableAgents.KNOWLEDGE_AGENT)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    <Network className="h-5 w-5" />
                    {knowledgeAgentRunning && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--agent-knowledge))] animate-pulse-subtle" />
                    )}
                    {isHovering === AvailableAgents.KNOWLEDGE_AGENT && !knowledgeAgentRunning && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(var(--agent-knowledge))] opacity-0 animate-fade-in" />
                    )}
                  </div>
                  <span className="flex w-full items-center justify-between">
                    Knowledge Agent
                    {knowledgeAgentRunning && (
                      <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-[hsl(var(--agent-knowledge))] animate-pulse-subtle" />
                    )}
                  </span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Configuration Section */}
          <SidebarGroup>
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Configuration
            </h3>
            <SidebarMenu>
              <SidebarMenuItem
                className={cn(
                  "transition-all-fast hover-scale",
                  pathname === "/agents" && "text-sidebar-accent-foreground"
                )}
              >
                <Link href="/agents" className="flex items-center gap-2 w-full">
                  <span><Brain className="h-5 w-5" /></span>
                  <span className="flex w-full">Agent Manager</span>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem
                className={cn(
                  "transition-all-fast hover-scale",
                  pathname === "/teams" && "text-sidebar-accent-foreground"
                )}
              >
                <Link href="/teams" className="flex items-center gap-2 w-full">
                  <span><Users className="h-5 w-5" /></span>
                  <span className="flex w-full">Team Manager</span>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem
                className={cn(
                  "transition-all-fast hover-scale",
                  pathname === "/workflows" && "text-sidebar-accent-foreground"
                )}
              >
                <Link href="/workflows" className="flex items-center gap-2 w-full">
                  <span><Workflow className="h-5 w-5" /></span>
                  <span className="flex w-full">Workflow Editor</span>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem
                className="transition-all-fast hover-scale"
                onClick={onShowMCPConfigModal}
              >
                <div className="flex items-center gap-2 w-full">
                  <span><Server className="h-5 w-5" /></span>
                  <span className="flex w-full">MCP Servers</span>
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem
                className="transition-all-fast hover-scale"
                onClick={onShowSettingsModal}
              >
                <div className="flex items-center gap-2 w-full">
                  <span><Settings className="h-5 w-5" /></span>
                  <span className="flex w-full">Settings</span>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="mt-auto">
          <SidebarGroup>
            <div className="space-y-1 px-2">
              {/* Theme Toggle - Only render when mounted to avoid hydration mismatch */}
              {mounted && (
                <SidebarMenuButton
                  variant="default"
                  size="sm"
                  onClick={toggleTheme}
                  tooltip={theme === "dark" ? "Light Mode" : "Dark Mode"}
                  className="transition-all-fast hover-scale"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 animate-fade-in" />
                  ) : (
                    <Moon className="h-5 w-5 animate-fade-in" />
                  )}
                </SidebarMenuButton>
              )}

              {/* Help Button */}
              <SidebarMenuButton
                variant="default"
                size="sm"
                tooltip="Help"
                className="transition-all-fast hover-scale"
                onClick={() => setShowHelpModal(true)}
              >
                <HelpCircle className="h-5 w-5" />
              </SidebarMenuButton>

              {/* GitHub Link */}
              <SidebarMenuButton
                variant="default"
                size="sm"
                tooltip="GitHub"
                className="transition-all-fast hover-scale"
                asChild
              >
                <a href="https://github.com/CopilotKit/CopilotKit" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </SidebarMenuButton>
            </div>

            {/* Version Info */}
            <div className="px-4 py-2 text-xs text-sidebar-foreground/50">
              Version 0.1.0
            </div>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>

      {/* Help Modal */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}
