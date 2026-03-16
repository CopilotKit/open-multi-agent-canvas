"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { 
  BookOpen, 
  MapPin, 
  Network, 
  Server, 
  ArrowRight, 
  Activity,
  Users,
  Settings,
  Database
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCoAgent } from "@copilotkit/react-core";
import { AvailableAgents } from "@/lib/available-agents";

export function Dashboard() {
  const router = useRouter();
  
  // Get agent states
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to KB-multi-agent - Your AI Agent Hub
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Users className="h-4 w-4" />
              Users
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Agents
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[
                  travelAgentRunning,
                  researchAgentRunning,
                  mcpAgentRunning,
                  knowledgeAgentRunning
                ].filter(Boolean).length}
                <span className="text-xs text-muted-foreground ml-1">/ 4</span>
              </div>
              <Progress 
                value={
                  ([
                    travelAgentRunning,
                    researchAgentRunning,
                    mcpAgentRunning,
                    knowledgeAgentRunning
                  ].filter(Boolean).length / 4) * 100
                } 
                className="mt-2"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Knowledge Entities
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                --
              </div>
              <p className="text-xs text-muted-foreground">
                Entities in knowledge graph
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Server Status
              </CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="text-sm font-medium">Online</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All systems operational
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Database
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="text-sm font-medium">Connected</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supabase integration active
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mt-2">Available Agents</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--agent-knowledge))]/10 flex items-center justify-center">
                    <Network className="h-4 w-4 text-[hsl(var(--agent-knowledge))]" />
                  </div>
                  Knowledge Agent
                </CardTitle>
                <Badge variant={knowledgeAgentRunning ? "default" : "outline"}>
                  {knowledgeAgentRunning ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Create and manage knowledge graphs with entities and relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-knowledge))]"></div>
                  Entity and relationship management
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-knowledge))]"></div>
                  Interactive graph visualization
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-knowledge))]"></div>
                  Persistent storage with Supabase
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full gap-1">
                <Link href="/knowledge">
                  Open Knowledge Agent
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--agent-mcp))]/10 flex items-center justify-center">
                    <Server className="h-4 w-4 text-[hsl(var(--agent-mcp))]" />
                  </div>
                  MCP Agent
                </CardTitle>
                <Badge variant={mcpAgentRunning ? "default" : "outline"}>
                  {mcpAgentRunning ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Configure and manage MCP servers for agent communication
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-mcp))]"></div>
                  Server configuration and management
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-mcp))]"></div>
                  Agent-to-agent communication
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-mcp))]"></div>
                  Real-time server monitoring
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full gap-1">
                <Link href="/mcp">
                  Open MCP Agent
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--agent-travel))]/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-[hsl(var(--agent-travel))]" />
                  </div>
                  Travel Agent
                </CardTitle>
                <Badge variant={travelAgentRunning ? "default" : "outline"}>
                  {travelAgentRunning ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Plan trips and explore destinations with interactive maps
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-travel))]"></div>
                  Interactive map interface
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-travel))]"></div>
                  Trip planning and itinerary creation
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-travel))]"></div>
                  Location search and recommendations
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full gap-1">
                <Link href="/travel">
                  Open Travel Agent
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--agent-research))]/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-[hsl(var(--agent-research))]" />
                  </div>
                  Research Agent
                </CardTitle>
                <Badge variant={researchAgentRunning ? "default" : "outline"}>
                  {researchAgentRunning ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Conduct research and generate comprehensive reports
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-research))]"></div>
                  Web search and information retrieval
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-research))]"></div>
                  Report generation with citations
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--agent-research))]"></div>
                  Research history and tracking
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full gap-1">
                <Link href="/research">
                  Open Research Agent
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
