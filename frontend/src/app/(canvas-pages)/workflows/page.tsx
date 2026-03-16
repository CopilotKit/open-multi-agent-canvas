'use client';

import React from 'react';
import { WorkflowEditor } from '@/components/workflow-editor';

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflow Editor</h1>
          <p className="text-muted-foreground">
            Create and manage agent workflows
          </p>
        </div>
        
        <WorkflowEditor />
      </div>
    </div>
  );
}
