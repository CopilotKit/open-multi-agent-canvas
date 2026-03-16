"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { 
  AppSettings} from "@/lib/settings-types";
import { 
  DEFAULT_SETTINGS, 
  SETTINGS_STORAGE_KEY 
} from "@/lib/settings-types";

// Create context
type SettingsContextType = {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
  updateApiKey: (key: keyof AppSettings['apiKeys'], value: string) => void;
  updateFeatureFlag: (flag: keyof AppSettings['featureFlags'], value: boolean) => void;
  isLoaded: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [savedSettings, setSavedSettings] = useLocalStorage<AppSettings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS
  );
  
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from local storage
  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
    }
    setIsLoaded(true);
  }, [savedSettings]);

  // Update entire settings object
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setSavedSettings(newSettings);
  };

  // Update a specific API key
  const updateApiKey = (key: keyof AppSettings['apiKeys'], value: string) => {
    const newSettings = {
      ...settings,
      apiKeys: {
        ...settings.apiKeys,
        [key]: value,
      },
    };
    setSettings(newSettings);
    setSavedSettings(newSettings);
  };

  // Update a specific feature flag
  const updateFeatureFlag = (flag: keyof AppSettings['featureFlags'], value: boolean) => {
    const newSettings = {
      ...settings,
      featureFlags: {
        ...settings.featureFlags,
        [flag]: value,
      },
    };
    setSettings(newSettings);
    setSavedSettings(newSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateApiKey,
        updateFeatureFlag,
        isLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Hook for using the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
