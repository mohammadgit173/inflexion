"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

/**
 * Radix accordion restyled to the Inflexion tokens: hairline dividers, no
 * card, no radius. Radix supplies aria-expanded, the trigger/panel wiring
 * and keyboard support; the height animation uses its measured CSS var.
 */
const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-[var(--hairline)]", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex flex-1 items-start justify-between gap-6 py-6 text-left",
        "text-base leading-snug transition-colors hover:text-[var(--accent-text)] sm:text-lg",
        className,
      )}
      {...props}
    >
      {children}
      {/* A plus that becomes a minus — squarer than a chevron, and it reads
          as a technical mark rather than a UI affordance. */}
      <span
        aria-hidden="true"
        className="relative mt-1.5 h-3 w-3 shrink-0 text-[var(--text-faint)] transition-colors group-hover:text-[var(--accent)]"
      >
        <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-300 group-data-[state=open]:scale-y-0" />
      </span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    // forceMount keeps every answer in the page even while collapsed. Radix
    // otherwise unmounts closed panels, which left all five FAQ answers out
    // of the HTML entirely — nothing for search engines to read, and nothing
    // for a browser's find-in-page to match.
    // As with the tabs, forceMount means Radix stops hiding closed panels, so
    // the state-driven "hidden" does it here.
    forceMount
    className="overflow-hidden data-[state=closed]:hidden motion-safe:data-[state=open]:animate-[accordion-down_240ms_ease-out]"
    {...props}
  >
    <div
      className={cn(
        "max-w-2xl pb-6 pr-8 text-[0.9375rem] leading-relaxed text-[var(--text-muted)]",
        className,
      )}
    >
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
