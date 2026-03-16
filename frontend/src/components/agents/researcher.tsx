import type { FC} from "react";
import { useEffect, useRef, useState } from "react";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { CheckCircleIcon, BookOpen, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

import type { Log } from "@/components/coagents-provider";
import { ResearchLogs } from "@/components/research-logs";
import { ResearchPaperSkeleton } from "@/components/skeletons";
import { AvailableAgents } from "@/lib/available-agents";

// Define a type for the code component props
type CodeProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};




export type Resource = {
  url: string;
  title: string;
  description: string;
};

export type ResearchAgentState = {
  model: string;
  research_question: string;
  report: string;
  resources: Resource[];
  logs: Log[];
};

export const AIResearchAgent: FC = () => {
  const [logs, setLogs] = useState<
    Array<{
      message: string;
      done: boolean;
    }>
  >([]);

  const isResearchInProgress = useRef(false);

  const { state: researchAgentState, stop: stopResearchAgent } =
    useCoAgent<ResearchAgentState>({
      name: AvailableAgents.RESEARCH_AGENT,
      initialState: {
        model: "openai",
        research_question: "",
        resources: [],
        report: "",
        logs: [],
      },
    });

  useEffect(() => {
    if (researchAgentState.logs) {
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs];
        researchAgentState.logs.forEach((log) => {
          const existingLogIndex = newLogs.findIndex(
            (l) => l.message === log.message
          );
          if (existingLogIndex >= 0) {
            // Only update done status if changing from false to true
            if (log.done && !newLogs[existingLogIndex].done) {
              newLogs[existingLogIndex].done = true;
            }
          } else {
            newLogs.push(log);
          }
        });
        return newLogs;
      });
    }
  }, [researchAgentState.logs]);

  useCoAgentStateRender({
    name: AvailableAgents.RESEARCH_AGENT,
    handler: ({ nodeName }) => {
      // HACK nodeName __end__ stop the research agent
      if (nodeName === "__end__") {
        setTimeout(() => {
          stopResearchAgent();
        }, 1000);
      }
    },
    render: ({ status }) => {
      if (status === "inProgress") {
        isResearchInProgress.current = true;
        return <ResearchLogs logs={logs ?? []} />;
      }

      if (status === "complete") {
        isResearchInProgress.current = false;
        return (
          <div className="animate-fade-in">
            <div className="prose max-w-none">
              <div className="flex items-center gap-2 text-[hsl(var(--agent-research))] mb-4 p-2 bg-[hsl(var(--agent-research))]/10 rounded-md">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">Research complete</span>
              </div>
            </div>
          </div>
        );
      }
    },
  });

  if (isResearchInProgress.current) {
    return (
      <div className="flex flex-col gap-4 h-full z-[999]">
        <ResearchPaperSkeleton />
      </div>
    );
  }

  if (!researchAgentState.report) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 h-full z-[999] animate-fade-in">
      <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--agent-research))]/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-[hsl(var(--agent-research))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Research Report</h3>
            <p className="text-sm text-muted-foreground">
              {researchAgentState.research_question}
            </p>
          </div>
        </div>

        <ReactMarkdown
          className="prose prose-sm md:prose-base lg:prose-lg max-w-none bg-background p-6 rounded-lg border border-border animate-fade-in-up"
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold mb-6 pb-2 border-b border-border">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold mb-4 mt-8">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-bold mb-3 mt-6">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[hsl(var(--agent-research))]/30 pl-4 py-2 my-6 bg-[hsl(var(--agent-research))]/5 rounded-r">
                {children}
              </blockquote>
            ),
            code: ({ inline, children, ...props }: CodeProps) => {
              if (inline) {
                return (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <div className="bg-muted/50 rounded-md p-1 my-4">
                  <div className="flex items-center justify-between px-4 py-1 border-b border-border">
                    <div className="text-xs text-muted-foreground">Code</div>
                  </div>
                  <pre className="p-4 overflow-x-auto">
                    <code className="text-sm font-mono" {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },
          }}
        >
          {researchAgentState.report}
        </ReactMarkdown>

        {researchAgentState.resources &&
          researchAgentState.resources.length > 0 && (
            <div className="prose max-w-none z-[999] bg-background p-6 rounded-lg border border-border mt-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--agent-research))]/10 flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-[hsl(var(--agent-research))]" />
                </div>
                <h2 className="text-xl font-bold">Resources</h2>
              </div>
              <ul className="list-none pl-0 mb-4 space-y-3 divide-y divide-border">
                {researchAgentState.resources.map((resource, index) => (
                  <li key={index} className="pt-3 first:pt-0">
                    <div className="flex items-start">
                      <div className="flex-1">
                        {resource.url ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium flex items-center gap-1"
                          >
                            {resource.title || resource.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="font-medium">{resource.title}</span>
                        )}
                        {resource.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
};
