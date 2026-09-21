"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      // Drives the [data-theme] selectors in globals.css.
      attribute="data-theme"
      // Dark on a first visit regardless of the OS setting. The toggle's choice
      // is then persisted to localStorage and wins from then on.
      defaultTheme="dark"
      enableSystem={false}
      // Suppresses the cross-fade that would otherwise animate every token at once.
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
