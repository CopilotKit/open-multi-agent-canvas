import type { FC } from "react";

import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type ResearchLog = {
  message: string;
  done: boolean;
};

type ResearchLogsProps = {
  logs: ResearchLog[];
};

export const ResearchLogs: FC<ResearchLogsProps> = ({ logs }) => (
  <div className="p-6 bg-card rounded-lg border border-border shadow-sm animate-fade-in">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-research))]/10 flex items-center justify-center">
        <BookOpen className="h-5 w-5 text-[hsl(var(--agent-research))]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Research in Progress</h3>
        <p className="text-sm text-muted-foreground">Gathering information...</p>
      </div>
    </div>

    <div className="mb-4 w-full">
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-[hsl(var(--agent-research))] rounded-full animate-progress w-1/3"></div>
      </div>
    </div>

    <section aria-labelledby="research-logs-title" className="mt-6">
      <ol className="relative border-l border-border ml-3 space-y-4">
        {logs?.map((log, index) => (
          <li key={index} className="ml-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={cn(
              "absolute w-3 h-3 rounded-full -left-1.5 border",
              log.done
                ? "bg-[hsl(var(--agent-research))] border-[hsl(var(--agent-research))]/30"
                : "bg-muted border-border animate-pulse-subtle"
            )}>
              {log.done && (
                <div className="w-2 h-2 bg-background rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            <p className={cn(
              "text-sm font-normal",
              log.done ? "text-foreground" : "text-muted-foreground"
            )}>
              {log.message}
            </p>
          </li>
        ))}
      </ol>
    </section>
  </div>
);
