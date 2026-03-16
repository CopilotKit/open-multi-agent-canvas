"use client";

import React, { useState } from "react";

import { CopilotKit } from "@copilotkit/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { CoAgentsProvider } from "@/components/coagents-provider";
import { useMounted } from "@/lib/use-mounted";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { useSettings } from "@/providers/SettingsProvider";

// Create a client with better hydration handling
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable automatic refetching on window focus for better performance
        refetchOnWindowFocus: false,
        // Disable retries for simpler debugging
        retry: false,
        // Stale time of 5 minutes for better caching
        staleTime: 1000 * 60 * 5,
      },
    },
  });
}

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
  // Create a new QueryClient instance for each session
  // This prevents hydration issues by ensuring the client is created on the client side
  const [queryClient] = useState(() => createQueryClient());
  const mounted = useMounted();

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <CopilotKitWithSettings>
          <CoAgentsProvider>{children}</CoAgentsProvider>
        </CopilotKitWithSettings>
        {/* Only show devtools when mounted and in development */}
        {mounted && process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </SettingsProvider>
    </QueryClientProvider>
  );
}
