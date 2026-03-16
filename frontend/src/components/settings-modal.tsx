"use client";

import { useState, useEffect } from "react";

import {
  Key,
  Save,
  Moon,
  Sun,
  Bug,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type {
  AppSettings} from "@/lib/settings-types";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY
} from "@/lib/settings-types";
import { cn } from "@/lib/utils";

// UI Components

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  // Get settings from local storage
  const [savedSettings, setSavedSettings] = useLocalStorage<AppSettings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  // Local state for form
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'api-keys' | 'features'>('api-keys');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showLangsmithKey, setShowLangsmithKey] = useState(false);
  const [showCopilotKey, setShowCopilotKey] = useState(false);
  const [showGraphitiKey, setShowGraphitiKey] = useState(false);

  // Load settings from local storage
  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
    }
    setIsLoading(false);
  }, [savedSettings]);

  // Save settings
  const saveSettings = () => {
    setSavedSettings(settings);
    onClose();
  };

  // Update API key
  const updateApiKey = (key: keyof AppSettings['apiKeys'], value: string) => {
    setSettings({
      ...settings,
      apiKeys: {
        ...settings.apiKeys,
        [key]: value,
      },
    });
  };

  // Update feature flag
  const updateFeatureFlag = (flag: keyof AppSettings['featureFlags'], value: boolean) => {
    setSettings({
      ...settings,
      featureFlags: {
        ...settings.featureFlags,
        [flag]: value,
      },
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] animate-fade-in-up">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Application Settings</DialogTitle>
              <DialogDescription>
                Configure API keys and application settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b mb-6 mt-2">
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm transition-all-fast relative",
              activeTab === 'api-keys'
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('api-keys')}
          >
            <div className="flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              <span>API Keys</span>
            </div>
            {activeTab === 'api-keys' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-fade-in" />
            )}
          </button>
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm transition-all-fast relative",
              activeTab === 'features'
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('features')}
          >
            <div className="flex items-center gap-1.5">
              <Sun className="w-4 h-4" />
              <span>Features</span>
            </div>
            {activeTab === 'features' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-fade-in" />
            )}
          </button>
        </div>

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>OpenAI API Key</span>
                <button
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              <Input
                type={showOpenAIKey ? "text" : "password"}
                value={settings.apiKeys.openaiApiKey}
                onChange={(e) => updateApiKey('openaiApiKey', e.target.value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Required for the backend agent functionality
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Langsmith API Key</span>
                <button
                  onClick={() => setShowLangsmithKey(!showLangsmithKey)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showLangsmithKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              <Input
                type={showLangsmithKey ? "text" : "password"}
                value={settings.apiKeys.langsmithApiKey}
                onChange={(e) => updateApiKey('langsmithApiKey', e.target.value)}
                placeholder="ls-..."
              />
              <p className="text-xs text-muted-foreground">
                Optional for LangSmith tracing and monitoring
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Copilot Cloud API Key</span>
                <button
                  onClick={() => setShowCopilotKey(!showCopilotKey)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showCopilotKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              <Input
                type={showCopilotKey ? "text" : "password"}
                value={settings.apiKeys.copilotCloudApiKey}
                onChange={(e) => updateApiKey('copilotCloudApiKey', e.target.value)}
                placeholder="cpk-..."
              />
              <p className="text-xs text-muted-foreground">
                Required for the frontend chat functionality
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Graphiti API Key</span>
                <button
                  onClick={() => setShowGraphitiKey(!showGraphitiKey)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showGraphitiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              <Input
                type={showGraphitiKey ? "text" : "password"}
                value={settings.apiKeys.graphitiApiKey}
                onChange={(e) => updateApiKey('graphitiApiKey', e.target.value)}
                placeholder="gft-..."
              />
              <p className="text-xs text-muted-foreground">
                Optional for Knowledge Graph functionality
              </p>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Checkbox
                id="dark-mode"
                checked={settings.featureFlags.enableDarkMode}
                onCheckedChange={(checked) =>
                  updateFeatureFlag('enableDarkMode', checked === true)
                }
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor="dark-mode"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <Moon className="w-4 h-4 text-primary" />
                </div>
                Enable Dark Mode
              </label>
            </div>

            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Checkbox
                id="debug-mode"
                checked={settings.featureFlags.enableDebugMode}
                onCheckedChange={(checked) =>
                  updateFeatureFlag('enableDebugMode', checked === true)
                }
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor="debug-mode"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <Bug className="w-4 h-4 text-primary" />
                </div>
                Enable Debug Mode
              </label>
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-md">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400 mr-2 flex-shrink-0 animate-pulse-subtle" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Some features are experimental and may not work as expected.
                  Changes to these settings may require a page refresh to take effect.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="transition-all-fast hover-scale">
            Cancel
          </Button>
          <Button onClick={saveSettings} className="transition-all-fast hover-scale animate-fade-in">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
