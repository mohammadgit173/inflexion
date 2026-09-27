"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

/**
 * Radix tabs restyled to the Inflexion tokens: mono labels, a hairline track
 * and an accent underline on the active tab. Radix supplies roving tabindex,
 * arrow-key navigation and the aria wiring.
 */
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-8 border-b border-[var(--hairline)]",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "mono relative -mb-px whitespace-nowrap border-b px-0 py-4",
      "text-[0.6875rem] uppercase tracking-[0.14em] transition-colors",
      "border-transparent text-[var(--text-faint)]",
      "hover:text-[var(--text)]",
      "data-[state=active]:border-[var(--accent)] data-[state=active]:text-[var(--text)]",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    // forceMount keeps BOTH panels in the page. Without it Radix unmounts the
    // inactive one, so the courses listed under the second tab existed only
    // after a click — invisible to search engines and to in-page search.
    // With forceMount Radix no longer hides the inactive panel itself, so the
    // state-driven "hidden" below does it: out of sight and out of the
    // accessibility tree, still present in the markup.
    forceMount
    className={cn(
      "mt-10 data-[state=inactive]:hidden data-[state=active]:motion-safe:animate-[tab-fade_280ms_cubic-bezier(0.22,1,0.36,1)]",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
