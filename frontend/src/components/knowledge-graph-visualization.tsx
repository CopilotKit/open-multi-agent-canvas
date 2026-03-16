"use client";

import React, { useEffect, useRef, useState } from 'react';

import { Search, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { DataSet } from 'vis-data';
import type { Node, Edge, Options } from 'vis-network';
import { Network } from 'vis-network';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type GraphNode = {
  id: string;
  name: string;
  type: string;
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

type KnowledgeGraphVisualizationProps = {
  graphData: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  className?: string;
};

export const KnowledgeGraphVisualization: React.FC<KnowledgeGraphVisualizationProps> = ({
  graphData,
  onNodeClick,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<string[]>([]);

  // Convert GraphData to vis-network format
  useEffect(() => {
    if (!containerRef.current) return;

    // Create nodes dataset
    const nodes = new DataSet<Node>(
      graphData.nodes.map(node => ({
        id: node.id,
        label: node.name,
        title: `${node.name} (${node.type})`,
        group: node.type,
        // Store the original node data for reference
        originalData: node,
      }))
    );

    // Create edges dataset
    const edges = new DataSet<Edge>(
      graphData.links.map((link, index) => ({
        id: index.toString(),
        from: link.source,
        to: link.target,
        label: link.type,
        // Store the original link data for reference
        originalData: link,
      }))
    );

    // Network configuration options
    const options: Options = {
      nodes: {
        shape: 'dot',
        size: 16,
        font: {
          size: 12,
          face: 'Inter',
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        width: 1.5,
        color: { inherit: 'from' },
        smooth: {
          type: 'continuous',
          roundness: 0.2,
        },
        font: {
          size: 10,
          align: 'middle',
          background: 'white',
        },
        arrows: {
          to: { enabled: true, scaleFactor: 0.5 },
        },
      },
      physics: {
        stabilization: {
          iterations: 100,
        },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.1,
          springLength: 150,
          springConstant: 0.05,
          damping: 0.09,
        },
      },
      groups: {
        // Define colors for different node types
        concept: { color: { background: '#4CAF50', border: '#2E7D32' } },
        person: { color: { background: '#2196F3', border: '#0D47A1' } },
        organization: { color: { background: '#FF9800', border: '#E65100' } },
        location: { color: { background: '#9C27B0', border: '#4A148C' } },
        event: { color: { background: '#F44336', border: '#B71C1C' } },
        custom: { color: { background: '#607D8B', border: '#263238' } },
        // Default for any other types
        default: { color: { background: '#607D8B', border: '#263238' } },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: true,
        dragView: true,
      },
    };

    // Create the network
    networkRef.current = new Network(containerRef.current, { nodes, edges }, options);

    // Handle node click events
    networkRef.current.on('click', function(params) {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.get(nodeId);
        if (node && node.originalData && onNodeClick) {
          onNodeClick(node.originalData as GraphNode);
        }
      }
    });

    // Clean up on unmount
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [graphData, onNodeClick]);

  // Handle search
  const handleSearch = () => {
    if (!searchTerm.trim() || !networkRef.current) return;

    const matchingNodes = graphData.nodes
      .filter(node =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.entries(node.properties).some(([_key, value]) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .map(node => node.id);

    setFilteredNodes(matchingNodes);

    if (matchingNodes.length > 0 && networkRef.current) {
      // Focus on the first matching node
      networkRef.current.focus(matchingNodes[0], {
        scale: 1.2,
        animation: true,
      });

      // Highlight matching nodes
      networkRef.current.selectNodes(matchingNodes);
    }
  };

  // Reset the view
  const resetView = () => {
    if (networkRef.current) {
      networkRef.current.fit({
        animation: true,
      });
      networkRef.current.unselectAll();
      setSearchTerm('');
      setFilteredNodes([]);
    }
  };

  // Zoom controls
  const zoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale() * 1.2;
      networkRef.current.moveTo({
        scale: scale,
        animation: true,
      });
    }
  };

  const zoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale() / 1.2;
      networkRef.current.moveTo({
        scale: scale,
        animation: true,
      });
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={zoomIn} title="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={zoomOut} title="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={resetView} title="Reset view">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {graphData.nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full bg-muted/20 rounded-md border border-dashed">
          <div className="text-center p-4">
            <p className="text-muted-foreground">No data to visualize</p>
            <p className="text-sm text-muted-foreground/70">Search for concepts or entities to visualize the knowledge graph</p>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 border rounded-md bg-card/50 min-h-[300px]"
          style={{ height: 'calc(100% - 40px)' }}
        />
      )}

      {filteredNodes.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Found {filteredNodes.length} matching nodes
        </div>
      )}
    </div>
  );
};
