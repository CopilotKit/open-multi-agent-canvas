'use client';

import React, { useState, useEffect } from 'react';
import { TeamManager } from '@/components/team-manager';
import { AgentConfig } from '@/components/agent-creation-form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export default function TeamsPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const apiClient = new ApiClient('http://localhost:8124');
        const response = await apiClient.fetchWithRetry('/agents');

        if (Array.isArray(response)) {
          setAgents(response.map(agent => ({
            id: agent.id || `agent-${Date.now()}`,
            name: agent.name,
            description: agent.description || '',
            instructions: agent.instructions || '',
            model: agent.model || 'gpt-4o',
            framework: agent.framework || 'langgraph',
            enableTracing: agent.enable_tracing || false,
            enableVoice: agent.enable_voice || false,
            enableParallel: agent.enable_parallel || false,
            enableLiteLLM: agent.enable_litellm || false,
            tools: agent.tools || []
          })));
        } else {
          console.error('Invalid response format:', response);
          toast({
            title: 'Error',
            description: 'Failed to load agents. Invalid response format.',
            variant: 'destructive'
          });
          setAgents([]);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load agents. Please try again.',
          variant: 'destructive'
        });
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading agents...</span>
      </div>
    );
  }

  return <TeamManager availableAgents={agents} />;
}
