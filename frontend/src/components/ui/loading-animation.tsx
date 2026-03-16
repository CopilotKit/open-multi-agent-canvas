"use client";

import React from "react";

import { cn } from "@/lib/utils";

export function LoadingAnimation({
  className,
  size = "default",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-full border-4 border-primary/30 rounded-full"></div>
        <div className="absolute w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
      <svg
        className="animate-pulse opacity-75"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray="60 30"
          strokeLinecap="round"
          className="text-primary/50"
        />
      </svg>
    </div>
  );
}

export function LoadingDots({
  className,
  size = "default",
  color = "primary",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
  color?: "primary" | "secondary" | "accent" | "muted";
}) {
  const sizeClasses = {
    sm: "w-1 h-1 mx-0.5",
    default: "w-2 h-2 mx-1",
    lg: "w-3 h-3 mx-1.5",
  };

  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    muted: "bg-muted-foreground",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full animate-bounce [animation-delay:-0.3s]",
          sizeClasses[size],
          colorClasses[color]
        )}
      ></div>
      <div
        className={cn(
          "rounded-full animate-bounce [animation-delay:-0.15s]",
          sizeClasses[size],
          colorClasses[color]
        )}
      ></div>
      <div
        className={cn(
          "rounded-full animate-bounce",
          sizeClasses[size],
          colorClasses[color]
        )}
      ></div>
    </div>
  );
}

export function LoadingPulse({
  className,
  width = "w-full",
  height = "h-8",
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        width,
        height,
        className
      )}
    />
  );
}

export function LoadingSpinner({
  className,
  size = "default",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <svg
      className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

export function LoadingProgress({
  className,
  value = 0,
  indeterminate = false,
}: {
  className?: string;
  value?: number;
  indeterminate?: boolean;
}) {
  return (
    <div className={cn("w-full h-1 bg-muted rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full bg-primary rounded-full transition-all duration-300 ease-in-out",
          indeterminate && "animate-progress w-1/3"
        )}
        style={!indeterminate ? { width: `${Math.max(0, Math.min(100, value))}%` } : {}}
      ></div>
    </div>
  );
}

export function LoadingCard({
  className,
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div className={cn("space-y-3 rounded-lg border p-4", className)}>
      <LoadingPulse height="h-4" width="w-2/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingPulse key={i} height="h-3" />
      ))}
    </div>
  );
}
