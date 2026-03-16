"use client"

import * as React from "react"

import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define our own ThemeProviderProps type instead of importing from next-themes/dist/types
type Attribute = 'class' | 'data-theme' | 'data-mode';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  forcedTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
  attribute?: Attribute | Attribute[];
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
