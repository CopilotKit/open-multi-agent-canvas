"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * ChunkErrorBoundary component to handle chunk loading errors
 * This component will catch errors related to chunk loading and provide a retry mechanism
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error("ChunkErrorBoundary caught an error:", error, errorInfo);
    
    // Update state with error details
    this.setState({ errorInfo });

    // Check if it's a chunk load error
    if (error.message && error.message.includes("ChunkLoadError") || 
        error.message.includes("Loading chunk") || 
        error.stack?.includes("webpack")) {
      console.log("Detected chunk loading error, will attempt to recover");
      
      // Report to Sentry if available
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureException(error);
      }
      
      // Attempt to recover by clearing cache and reloading
      this.attemptRecovery();
    }
  }

  attemptRecovery = (): void => {
    // Increment retry count
    this.setState(prevState => ({ retryCount: prevState.retryCount + 1 }));

    // Clear localStorage cache related to Next.js
    if (typeof window !== 'undefined') {
      // Clear any cache that might be related to Next.js
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('next-') || key.includes('chunk') || key.includes('webpack')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  handleRetry = (): void => {
    // Reset error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Attempt recovery
    this.attemptRecovery();
    
    // Reload the page if we've already tried a few times
    if (this.state.retryCount >= 2) {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="mb-4 text-red-500">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            We encountered an error loading this page. This might be due to a network issue or a recent update.
          </p>
          <Button 
            onClick={this.handleRetry} 
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Retry
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            If the problem persists, try clearing your browser cache or restarting the application.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add a type declaration for Sentry in the window object
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error) => void;
    };
  }
}
