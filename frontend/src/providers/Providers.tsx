"use client";

import React from "react";

import { CopilotKit } from "@copilotkit/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { CoAgentsProvider } from "@/components/coagents-provider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { useSettings } from "@/providers/SettingsProvider";

const queryClient = new QueryClient();

function CopilotKitWithSettings({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  // Use the API key from settings if available, otherwise use the environment variable
  const apiKey = settings.apiKeys.copilotCloudApiKey || process.env.NEXT_PUBLIC_COPILOT_CLOUD_API_KEY;

  return (
    <CopilotKit
      showDevConsole={settings.featureFlags.enableDebugMode}
      publicApiKey={apiKey}
    >
      {children}
    </CopilotKit>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <CopilotKitWithSettings>
          <CoAgentsProvider>{children}</CoAgentsProvider>
        </CopilotKitWithSettings>
        <ReactQueryDevtools initialIsOpen={false} />
      </SettingsProvider>
    </QueryClientProvider>
  );
}
