// Settings types for the application

// Local storage key for saving settings
export const SETTINGS_STORAGE_KEY = "app-settings";

// API Keys configuration
export interface ApiKeys {
  openaiApiKey?: string;
  langsmithApiKey?: string;
  copilotCloudApiKey?: string;
  graphitiApiKey?: string;
}

// Feature flags
export interface FeatureFlags {
  enableDarkMode?: boolean;
  enableDebugMode?: boolean;
}

// Application settings
export interface AppSettings {
  apiKeys: ApiKeys;
  featureFlags: FeatureFlags;
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  apiKeys: {
    openaiApiKey: "",
    langsmithApiKey: "",
    copilotCloudApiKey: "",
    graphitiApiKey: "",
  },
  featureFlags: {
    enableDarkMode: false,
    enableDebugMode: false,
  },
};
