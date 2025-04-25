"use client";

import type { FC } from "react";
import React, { useEffect, useState } from "react";

import { useCoAgent } from "@copilotkit/react-core";
import { Search, Plus, RotateCw, Info, Filter, Network, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AvailableAgents } from "@/lib/available-agents";
import { cn } from "@/lib/utils";

import { EntityForm } from "./entity-form";

type GraphNode = {
  id: string;
  name: string;
  type: string;
  val: number; // Size of node
  color?: string;
  properties: Record<string, unknown>;
};

type GraphLink = {
  source: string;
  target: string;
  type: string;
  properties?: Record<string, unknown>;
};

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  properties: Record<string, unknown>;
}

interface KnowledgeRelation {
  source_id: string;
  target_id: string;
  type: string;
  properties?: Record<string, unknown>;
}

interface KnowledgeAgentState {
  entities: KnowledgeEntity[];
  relations: KnowledgeRelation[];
  isLoading?: boolean;
  error?: string;
}

export const KnowledgeGraph: FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState<GraphNode | null>(null);
  const [activeTab, setActiveTab] = useState("graph");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  // Get Knowledge agent state to access knowledge graph data
  const { state: knowledgeAgentState = { entities: [], relations: [] } } = useCoAgent({
    name: AvailableAgents.KNOWLEDGE_AGENT,
  }) as { state: KnowledgeAgentState };

  // Function to handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  // Function to add a new entity
  const addEntity = () => {
    setEntityToEdit(null);
    setShowEntityForm(true);
  };

  // Function to edit an entity
  const editEntity = (node: GraphNode) => {
    setEntityToEdit(node);
    setShowEntityForm(true);
  };

  // Function to save an entity
  const saveEntity = (entity: {
    id: string;
    name: string;
    type: string;
    properties: Record<string, unknown>;
  }) => {
    // In a real implementation, this would call the MCP agent to save the entity
    console.log("Saving entity:", entity);

    // For now, just update the local graph data
    setGraphData(prevData => {
      const newNodes = [...prevData.nodes];
      const existingNodeIndex = newNodes.findIndex(node => node.id === entity.id);

      if (existingNodeIndex >= 0) {
        // Update existing node
        newNodes[existingNodeIndex] = {
          ...newNodes[existingNodeIndex],
          name: entity.name,
          type: entity.type,
          properties: entity.properties,
        };
      } else {
        // Add new node
        newNodes.push({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          val: 5, // Default size
          color: getColorForType(entity.type),
          properties: entity.properties,
        });
      }

      return {
        nodes: newNodes,
        links: prevData.links,
      };
    });
  };



  // Helper function to get color based on entity type
  const getColorForType = (type: string): string => {
    const typeColors: Record<string, string> = {
      concept: "#4CAF50",
      person: "#2196F3",
      organization: "#FF9800",
      location: "#9C27B0",
      event: "#F44336",
      custom: "#607D8B",
    };

    return typeColors[type.toLowerCase()] || "#607D8B";
  };

  // Function to search the knowledge graph
  const searchGraph = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      // In a real implementation, this would trigger the knowledge agent to perform a search
      // For now, we'll just filter the existing data based on the search query
      const filteredNodes = knowledgeAgentState.entities
        .filter(entity =>
          entity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entity.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          Object.values(entity.properties || {}).some(value =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
        .map(entity => ({
          id: entity.id,
          name: entity.name || entity.id,
          type: entity.type,
          val: 5, // Default size
          color: getColorForType(entity.type),
          properties: entity.properties || {}
        }));

      // Get all relations that connect the filtered nodes
      const filteredLinks = knowledgeAgentState.relations
        .filter(relation =>
          filteredNodes.some(node => node.id === relation.source_id) &&
          filteredNodes.some(node => node.id === relation.target_id)
        )
        .map(relation => ({
          source: relation.source_id,
          target: relation.target_id,
          type: relation.type,
          properties: relation.properties || {}
        }));

      setGraphData({
        nodes: filteredNodes,
        links: filteredLinks
      });
    } catch (error) {
      console.error('Error searching knowledge graph:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset the graph view (removed duplicate)

  // Initialize with data from knowledge agent state
  useEffect(() => {
    if (knowledgeAgentState?.entities?.length > 0 || knowledgeAgentState?.relations?.length > 0) {
      // Extract all unique entity types
      const types = Array.from(new Set(knowledgeAgentState.entities.map(entity => entity.type)));
      setAvailableTypes(types);

      // Apply type filter if set
      let filteredEntities = knowledgeAgentState.entities;
      if (filterType) {
        filteredEntities = knowledgeAgentState.entities.filter(entity => entity.type === filterType);
      }

      // Convert entities to graph nodes
      const nodes = filteredEntities.map(entity => ({
        id: entity.id,
        name: entity.name || entity.id,
        type: entity.type,
        val: 5, // Default size
        color: getColorForType(entity.type),
        properties: entity.properties || {}
      }));

      // Convert relations to graph links - only include relations where both nodes are in our filtered set
      const nodeIds = new Set(nodes.map(node => node.id));
      const links = knowledgeAgentState.relations
        .filter(relation =>
          nodeIds.has(relation.source_id) && nodeIds.has(relation.target_id)
        )
        .map(relation => ({
          source: relation.source_id,
          target: relation.target_id,
          type: relation.type,
        properties: relation.properties || {}
      }));

      setGraphData({
        nodes,
        links
      });
    }
  }, [knowledgeAgentState.entities, knowledgeAgentState.relations, filterType]);

  // Function to reset view (simplified for card-based view)
  const resetView = () => {
    // In a card-based view, this could scroll to top or reset filters
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-10rem)] overflow-y-auto">
      {/* Entity Form Modal */}
      <EntityForm
        isOpen={showEntityForm}
        onClose={() => setShowEntityForm(false)}
        onSave={saveEntity}
        initialEntity={entityToEdit || undefined}
      />
      {/* Header and controls */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <h2 className="text-sm font-semibold">Knowledge Graph</h2>
          <div className="ml-1 bg-blue-100 text-blue-800 text-[10px] px-1 py-0.5 rounded-full">
            {graphData.nodes.length} nodes
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={resetView}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Reset view"
          >
            <RotateCw className="h-3 w-3" />
          </button>
          <button
            onClick={() => alert('Graph information and help')}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Information"
          >
            <Info className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Search, filter, and add controls */}
      <div className="flex mb-2 gap-1">
        <div className="relative flex-grow">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge graph..."
            className="h-8 text-xs pr-8"
            onKeyDown={(e) => e.key === 'Enter' && searchGraph()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-8 w-8"
            onClick={searchGraph}
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFilterType(null)}
                disabled={!filterType}
              >
                <Filter className={cn("h-3.5 w-3.5", filterType ? "text-primary" : "text-muted-foreground")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {filterType ? "Clear filter" : "No filter active"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="default"
          size="sm"
          className="h-8 gap-1"
          onClick={addEntity}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {/* Type filters */}
      <div className="mb-2 flex items-center gap-1 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" />
          <span>Filter by type:</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {availableTypes.length === 0 ? (
            <span className="text-xs text-muted-foreground">No types available</span>
          ) : (
            <>
              {availableTypes.map((type) => (
                <Badge
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:bg-muted/80 transition-colors",
                    filterType === type && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setFilterType(filterType === type ? null : type)}
                >
                  {type}
                  <span className="ml-1 text-xs opacity-70">
                    {knowledgeAgentState.entities.filter(e => e.type === type).length}
                  </span>
                </Badge>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="mb-2">
          <TabsTrigger value="graph" className="text-xs">
            <Network className="h-3.5 w-3.5 mr-1" />
            Graph View
          </TabsTrigger>
          <TabsTrigger value="list" className="text-xs">
            <Filter className="h-3.5 w-3.5 mr-1" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="flex-grow relative border rounded-md overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {graphData.nodes.length === 0 && !isLoading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center p-4">
                <Network className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No data to display</p>
                <p className="text-sm">Search for concepts or entities to visualize the knowledge graph</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="grid grid-cols-2 gap-2 p-1 w-full">
                {graphData.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`p-2 border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white text-xs ${selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: node.color }}
                      />
                      <h3 className="font-medium text-sm truncate">{node.name}</h3>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">{node.type}</span>
                      <span className="text-[10px] text-gray-500">ID: {node.id.substring(0, 8)}</span>
                    </div>
                    {node.properties && Object.keys(node.properties).length > 0 && (
                      <div className="mt-1.5 text-[11px] text-gray-600 border-t pt-1.5">
                        {Object.entries(node.properties)
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <div key={key} className="truncate flex items-baseline gap-1">
                              <span className="font-medium text-gray-700 min-w-[60px]">{key}:</span>
                              <span className="truncate">{String(value).substring(0, 25)}{String(value).length > 25 ? '...' : ''}</span>
                            </div>
                        ))}
                        {Object.keys(node.properties).length > 2 && (
                          <div className="text-[10px] text-blue-500 mt-0.5 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); alert(JSON.stringify(node.properties, null, 2)); }}>
                            +{Object.keys(node.properties).length - 2} more properties
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {graphData.nodes.length > 0 && (
              <div className="mt-3 p-2 border rounded-md w-full bg-white shadow-sm">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                    <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
                    <path d="M15 7h2a5 5 0 1 1 0 10h-2"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  Relationships ({graphData.links.length})
                </h3>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                  {graphData.links.length === 0 ? (
                    <div className="text-center text-gray-500 text-xs py-2">No relationships found</div>
                  ) : (
                    graphData.links.map((link, index) => {
                      const sourceNode = graphData.nodes.find(n => n.id === link.source);
                      const targetNode = graphData.nodes.find(n => n.id === link.target);
                      return (
                        <div key={index} className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center justify-between text-xs transition-colors">
                          <div
                            className="truncate max-w-[30%] flex items-center gap-1 cursor-pointer hover:text-blue-600"
                            onClick={() => handleNodeClick(sourceNode!)}
                            title={sourceNode?.name || String(link.source)}
                          >
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sourceNode?.color || '#999' }} />
                            {sourceNode?.name || String(link.source).substring(0, 10)}
                          </div>
                          <div className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {link.type}
                          </div>
                          <div
                            className="truncate max-w-[30%] flex items-center gap-1 cursor-pointer hover:text-blue-600"
                            onClick={() => handleNodeClick(targetNode!)}
                            title={targetNode?.name || String(link.target)}
                          >
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: targetNode?.color || '#999' }} />
                            {targetNode?.name || String(link.target).substring(0, 10)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="flex-grow relative border rounded-md overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {graphData.nodes.length === 0 && !isLoading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center p-4">
                <Filter className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No entities to display</p>
                <p className="text-sm">Add entities or search to populate the knowledge graph</p>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-2 overflow-y-auto h-full">
              {graphData.nodes.map((node) => (
                <Card
                  key={node.id}
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all",
                    selectedNode?.id === node.id && "ring-1 ring-primary"
                  )}
                  onClick={() => handleNodeClick(node)}
                >
                  <CardHeader className="p-3 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: node.color || getColorForType(node.type) }}
                        />
                        {node.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">{node.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 text-xs">
                    {Object.keys(node.properties).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(node.properties).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="font-medium min-w-[80px]">{key}:</span>
                            <span className="truncate">{String(value).substring(0, 50)}</span>
                          </div>
                        ))}
                        {Object.keys(node.properties).length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{Object.keys(node.properties).length - 3} more properties
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No properties</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selected node details */}
      {selectedNode && (
        <Card className="mt-3">
          <CardHeader className="p-3 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedNode.color || getColorForType(selectedNode.type) }}
                />
                {selectedNode.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{selectedNode.type}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => editEntity(selectedNode)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs mt-1">ID: {selectedNode.id}</CardDescription>
          </CardHeader>

          <CardContent className="p-3 pt-0">
            <h4 className="text-xs font-medium mb-1">Properties</h4>
            <div className="bg-muted/50 p-2 rounded-md">
              {selectedNode.properties && Object.entries(selectedNode.properties).length > 0 ? (
                <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                  {Object.entries(selectedNode.properties).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <div className="text-xs text-muted-foreground font-medium">{key}</div>
                      <div className="text-xs truncate">{String(value)}</div>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No properties available</p>
              )}
            </div>
          </CardContent>

          <CardContent className="p-3 pt-0 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => alert(`Find related to ${selectedNode.name}`)}
            >
              Find Related
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => editEntity(selectedNode)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedNode(null)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
