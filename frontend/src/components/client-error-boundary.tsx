"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

// Dynamically import the ChunkErrorBoundary with no SSR to avoid hydration issues
const ChunkErrorBoundary = dynamic(
  () => import("@/components/chunk-error-boundary").then(mod => mod.ChunkErrorBoundary),
  { ssr: false }
);

export function ClientErrorBoundary({ children }: { children: ReactNode }) {
  return <ChunkErrorBoundary>{children}</ChunkErrorBoundary>;
}
