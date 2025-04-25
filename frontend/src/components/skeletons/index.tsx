import type { FC } from "react";

import Image from "next/image";

import { LoadingAnimation, LoadingCard, LoadingDots, LoadingProgress } from "../ui/loading-animation";

export const EmailSkeleton: FC = () => (
  <div className="space-y-4 animate-fade-in">
    <LoadingCard className="animate-fade-in" rows={4} />
  </div>
);



export const EmailListSkeleton: FC = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
    <LoadingAnimation size="lg" className="text-primary" />
    <div className="text-center space-y-2">
      <h3 className="text-lg font-medium">Loading Agent Interface</h3>
      <p className="text-sm text-muted-foreground">Preparing your experience...</p>
      <div className="w-48 mx-auto mt-4">
        <LoadingProgress indeterminate className="mt-2" />
      </div>
    </div>
  </div>
);

export const ResearchPaperSkeleton: FC = () => (
  <div className="space-y-8 mt-8 animate-fade-in">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-research))] flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>
        <h2 className="text-xl font-semibold">Research in Progress</h2>
      </div>
      <LoadingProgress indeterminate className="w-32" />
    </div>

    {/* Title */}
    <div className="prose max-w-none">
      <LoadingCard className="mb-6" rows={1} />
    </div>

    {/* Sections */}
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <LoadingCard key={i} className="animate-fade-in" rows={3} />
      ))}
    </div>

    {/* Sources */}
    <div className="prose max-w-none mt-8 pt-6 border-t">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <span>Sources</span>
        <LoadingDots size="sm" />
      </h3>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, idx) => (
          <LoadingCard key={idx} className="animate-fade-in" rows={2} />
        ))}
      </div>
    </div>
  </div>
);

export const XKCDSkeleton: FC = () => (
  <div className="space-y-4 flex flex-col items-center animate-fade-in">
    <div className="relative w-[500px] h-[500px] rounded-lg border border-border overflow-hidden">
      <div className="absolute inset-0 bg-card/50 backdrop-blur-sm flex items-center justify-center">
        <LoadingAnimation size="lg" className="text-primary" />
      </div>
      <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm rounded-md px-3 py-1.5">
        <LoadingDots />
      </div>
    </div>
    <div className="flex gap-4">
      <div className="h-10 w-24 rounded-md border border-border flex items-center justify-center text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </div>
      <div className="h-10 w-24 rounded-md border border-border flex items-center justify-center text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </div>
    </div>
  </div>
);

export const ChatSkeleton: FC = () => (
  <div className="space-y-4 animate-fade-in">
    <div className="bg-card p-3 border border-border rounded-lg flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse-subtle"></div>
        <h3 className="font-medium text-sm">Chat Loading</h3>
      </div>
      <LoadingDots size="sm" />
    </div>

    <div className="space-y-4 p-4 border border-border rounded-lg">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
        </div>
        <div className="flex-1">
          <LoadingCard rows={2} />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div className="flex-1">
          <LoadingCard rows={3} />
        </div>
      </div>
    </div>

    <div className="relative">
      <div className="h-12 border border-border rounded-lg px-4 py-3 flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Type your message here...</span>
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </div>
      </div>
    </div>
  </div>
);

export const GenericSkeleton: FC = () => (
  <div className="w-full h-screen p-4 flex flex-col items-center justify-center animate-fade-in">
    <div className="relative w-24 h-24 mb-6 animate-float">
      <Image src="/logo.svg" alt="Multi-Agent Canvas" width={96} height={96} className="w-full h-full animate-glow" />
    </div>
    <LoadingDots size="lg" className="mb-4" />
    <p className="text-sm text-muted-foreground">Loading experience...</p>
  </div>
);

export const MapSkeleton: FC = () => (
  <div className="w-full h-full relative animate-fade-in">
    <div className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-lg border border-border overflow-hidden">
      <div className="w-full h-full bg-[url('/map-overlay.svg')] bg-cover bg-center bg-no-repeat opacity-20" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-travel))] flex items-center justify-center text-white mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Loading Map</h3>
        <p className="text-sm text-muted-foreground mb-4">Preparing your travel experience</p>
        <LoadingProgress indeterminate className="w-48" />
      </div>
    </div>
  </div>
);
