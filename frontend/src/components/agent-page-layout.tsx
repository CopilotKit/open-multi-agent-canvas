"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AgentPageLayoutProps {
  title: string;
  icon: ReactNode;
  accentColor: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AgentPageLayout({
  title,
  icon,
  accentColor,
  description,
  breadcrumbs = [],
  actions,
  children,
  className,
}: AgentPageLayoutProps) {
  return (
    <div className={cn("container mx-auto p-4 h-screen flex flex-col", className)}>
      {/* Header */}
      <div className="mb-4">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex mb-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Back button for mobile */}
        <div className="md:hidden mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>

        {/* Title and description */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
            >
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
