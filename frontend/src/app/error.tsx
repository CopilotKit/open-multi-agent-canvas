"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error("Application error:", error);

    // Check if it's a chunk load error
    if (
      error.message?.includes("ChunkLoadError") ||
      error.message?.includes("Loading chunk") ||
      error.stack?.includes("webpack")
    ) {
      console.log("Detected chunk loading error in error boundary");

      // Clear localStorage cache related to Next.js
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("next-") ||
          key.includes("chunk") ||
          key.includes("webpack")
        ) {
          localStorage.removeItem(key);
        }
      });

      // Report to Sentry if available
      if (typeof window !== "undefined" && window.Sentry) {
        window.Sentry.captureException(error);
      }
    }
  }, [error]);

  const handleRetry = () => {
    // Clear cache and reset the error boundary
    if (typeof window !== "undefined") {
      // Clear any cache that might be related to Next.js
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("next-") ||
          key.includes("chunk") ||
          key.includes("webpack")
        ) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Reset the error boundary
    reset();
  };

  const isChunkError = 
    error.message?.includes("ChunkLoadError") ||
    error.message?.includes("Loading chunk") ||
    error.stack?.includes("webpack");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="mb-4 text-red-500">
        <AlertCircle size={48} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        {isChunkError
          ? "We encountered an error loading this page. This might be due to a network issue or a recent update."
          : "An unexpected error occurred. Our team has been notified."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleRetry} className="flex items-center gap-2">
          <RefreshCw size={16} />
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home size={16} />
            Go to Home
          </Button>
        </Link>
      </div>
      {isChunkError && (
        <p className="text-xs text-muted-foreground mt-4">
          If the problem persists, try clearing your browser cache or restarting the application.
        </p>
      )}
    </div>
  );
}
