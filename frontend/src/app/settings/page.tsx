"use client";

import { useEffect, useState } from "react";

import {
  Key,
  Save,
  Moon,
  Sun,
  Bug,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/providers/SettingsProvider";

export default function SettingsPage() {
  const { settings, updateSettings, isLoaded } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showLangsmithKey, setShowLangsmithKey] = useState(false);
  const [showCopilotKey, setShowCopilotKey] = useState(false);
  const [showGraphitiKey, setShowGraphitiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Update local settings when global settings change
  useEffect(() => {
    if (isLoaded) {
      setLocalSettings(settings);
    }
  }, [settings, isLoaded]);

  // Update API key
  const updateApiKey = (key: keyof typeof localSettings.apiKeys, value: string) => {
    setLocalSettings({
      ...localSettings,
      apiKeys: {
        ...localSettings.apiKeys,
        [key]: value,
      },
    });
  };

  // Update feature flag
  const updateFeatureFlag = (flag: keyof typeof localSettings.featureFlags, value: boolean) => {
    setLocalSettings({
      ...localSettings,
      featureFlags: {
        ...localSettings.featureFlags,
        [flag]: value,
      },
    });
  };

  // Save settings
  const saveSettings = () => {
    setIsSaving(true);
    updateSettings(localSettings);

    // Show success message
    setSaveMessage("Settings saved successfully!");
    setTimeout(() => {
      setSaveMessage("");
      setIsSaving(false);
    }, 2000);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Application Settings</h1>
      </div>

      {saveMessage && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-600" />
              API Keys
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure API keys for various services used by the application.
              These keys are stored locally in your browser and are not sent to any server.
            </p>

            <div className="space-y-6">
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
                  value={localSettings.apiKeys.openaiApiKey}
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
                  value={localSettings.apiKeys.langsmithApiKey}
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
                  value={localSettings.apiKeys.copilotCloudApiKey}
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
                  value={localSettings.apiKeys.graphitiApiKey}
                  onChange={(e) => updateApiKey('graphitiApiKey', e.target.value)}
                  placeholder="gft-..."
                />
                <p className="text-xs text-muted-foreground">
                  Optional for Knowledge Graph functionality
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Sun className="w-5 h-5 mr-2 text-amber-500" />
              Features
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure application features and appearance.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dark-mode"
                  checked={localSettings.featureFlags.enableDarkMode}
                  onCheckedChange={(checked) =>
                    updateFeatureFlag('enableDarkMode', checked === true)
                  }
                />
                <label
                  htmlFor="dark-mode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Enable Dark Mode
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="debug-mode"
                  checked={localSettings.featureFlags.enableDebugMode}
                  onCheckedChange={(checked) =>
                    updateFeatureFlag('enableDebugMode', checked === true)
                  }
                />
                <label
                  htmlFor="debug-mode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Enable Debug Mode
                </label>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                Some features are experimental and may not work as expected.
                Changes to these settings may require a page refresh to take effect.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-6"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
