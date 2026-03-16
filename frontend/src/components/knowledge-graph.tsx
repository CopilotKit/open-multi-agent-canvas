"use client";

import type { FC} from "react";
import React, { useEffect, useState } from "react";

import { useCoAgent } from "@copilotkit/react-core";
import { Search, Plus, RotateCw, Info, Filter } from "lucide-react";

import { AvailableAgents } from "@/lib/available-agents";

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

export const KnowledgeGraph: FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState<GraphNode | null>(null);
  // No longer need graphRef since we're not using ForceGraph2D
  // const graphRef = useRef<any>(null);

  // Get MCP agent state to access knowledge graph data
  useCoAgent({
    name: AvailableAgents.MCP_AGENT,
  });

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

    return typeColors[type] || "#607D8B";
  };

  // Function to search the knowledge graph
  const searchGraph = () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    // This is a placeholder - in a real implementation, you would:
    // 1. Call the MCP agent with a search query
    // 2. Process the results and update the graph

    // Simulate loading
    setTimeout(() => {
      // Example data - in a real implementation, this would come from the MCP agent
      const newData: GraphData = {
        nodes: [
          { id: "1", name: "Concept A", type: "concept", val: 5, color: "#4CAF50", properties: {} },
          { id: "2", name: "Concept B", type: "concept", val: 3, color: "#4CAF50", properties: {} },
          { id: "3", name: "Entity X", type: "entity", val: 4, color: "#2196F3", properties: {} },
          { id: "4", name: "Entity Y", type: "entity", val: 2, color: "#2196F3", properties: {} },
          { id: "5", name: searchQuery, type: "search", val: 6, color: "#FFC107", properties: {} },
        ],
        links: [
          { source: "5", target: "1", type: "related_to" },
          { source: "5", target: "3", type: "related_to" },
          { source: "1", target: "2", type: "similar_to" },
          { source: "3", target: "4", type: "part_of" },
          { source: "2", target: "4", type: "related_to" },
        ],
      };

      setGraphData(newData);
      setIsLoading(false);
    }, 1000);
  };

  // Function to reset the graph view (removed duplicate)

  // Initialize with empty graph
  useEffect(() => {
    // In a real implementation, you might load an initial graph state here
    setGraphData({
      nodes: [],
      links: [],
    });
  }, []);

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

      {/* Search and add controls */}
      <div className="flex mb-1 gap-1">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge graph..."
            className="w-full px-1.5 py-0.5 text-xs border rounded-md pr-6"
            onKeyDown={(e) => e.key === 'Enter' && searchGraph()}
          />
          <button
            onClick={searchGraph}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <Search className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={addEntity}
          className="px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 flex items-center whitespace-nowrap"
        >
          <Plus className="h-2.5 w-2.5 mr-0.5" />
          Add
        </button>
      </div>

      {/* Filters and advanced controls */}
      <div className="mb-1 flex items-center gap-0.5 flex-wrap">
        <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
          <Filter className="h-2.5 w-2.5" />
          <span>Filters:</span>
        </div>
        <div className="flex gap-0.5 flex-wrap">
          <button className="px-1.5 py-0 text-[10px] rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
            Concepts
          </button>
          <button className="px-1.5 py-0 text-[10px] rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
            Entities
          </button>
          <button className="px-1.5 py-0 text-[10px] rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors">
            Relations
          </button>
        </div>
      </div>

      {/* Graph visualization */}
      <div className="flex-grow border rounded-md overflow-hidden bg-gray-50 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}

        {graphData.nodes.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>No data to display</p>
              <p className="text-sm">Search for concepts or entities to visualize the knowledge graph</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="grid grid-cols-2 gap-2 p-1 w-full">
              {graphData.nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-1.5 border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white text-xs"
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: node.color }}
                    />
                    <h3 className="font-medium text-xs">{node.name}</h3>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">{node.type}</span>
                  </div>
                  {node.properties && Object.keys(node.properties).length > 0 && (
                    <div className="mt-0.5 text-[10px] text-gray-500">
                      {Object.entries(node.properties)
                        .slice(0, 1)
                        .map(([key, value]) => (
                          <div key={key} className="truncate">
                            <span className="font-medium">{key}:</span> {String(value).substring(0, 15)}{String(value).length > 15 ? '...' : ''}
                          </div>
                        ))}
                      {Object.keys(node.properties).length > 1 && (
                        <div className="text-[10px] text-blue-500">+{Object.keys(node.properties).length - 1} more</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {graphData.nodes.length > 0 && (
              <div className="mt-2 p-1 border rounded-md w-full">
                <h3 className="font-medium text-xs mb-0.5">Relationships</h3>
                <div className="space-y-0.5">
                  {graphData.links.map((link, index) => (
                    <div key={index} className="p-0.5 bg-gray-50 rounded flex items-center justify-between text-xs">
                      <div className="truncate max-w-[30%]">
                        {graphData.nodes.find(n => n.id === link.source)?.name || link.source}
                      </div>
                      <div className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {link.type}
                      </div>
                      <div className="truncate max-w-[30%]">
                        {graphData.nodes.find(n => n.id === link.target)?.name || link.target}
                      </div>
                    </div>
                  ))}
                  {graphData.links.length === 0 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      No relationships found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected node details */}
      {selectedNode && (
        <div className="mt-2 p-2 border rounded-md bg-white shadow-sm text-xs">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-xs">{selectedNode.name}</h3>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full"
              style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color }}
            >
              {selectedNode.type}
            </span>
          </div>

          <div className="mt-1">
            <h4 className="text-[10px] font-medium text-gray-700 mb-0.5">Properties</h4>
            <div className="bg-gray-50 p-1 rounded-md">
              {selectedNode.properties && Object.entries(selectedNode.properties).length > 0 ? (
                <div className="grid grid-cols-2 gap-y-0.5 gap-x-1">
                  {Object.entries(selectedNode.properties).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <div className="text-[10px] text-gray-500 font-medium">{key}</div>
                      <div className="text-[10px] truncate">{String(value)}</div>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500">No properties available</p>
              )}
            </div>
          </div>

          <div className="mt-1 flex justify-end gap-1">
            <button
              className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              onClick={() => alert(`Find related to ${selectedNode.name}`)}
            >
              Find Related
            </button>
            <button
              className="px-1.5 py-0.5 text-[10px] bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
              onClick={() => editEntity(selectedNode)}
            >
              Edit
            </button>
            <button
              className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              onClick={() => setSelectedNode(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
