"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DrawnRule, Reveal } from "./reveal";

/**
 * Mono section number that types in character by character on entry.
 */
export function SectionNumber({ value }: { value: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className="mono text-xs text-[var(--text-faint)]">{value}</span>;
  }

  return (
    <span className="mono text-xs text-[var(--text-faint)]">
      {/* The full value stays readable to assistive tech while the visible
          characters type in one by one. */}
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {value.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.01, delay: 0.15 + i * 0.09 }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

type SectionProps = {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
  /** Visually hide the heading while keeping it for screen readers. */
  hideTitle?: boolean;
  /**
   * "label" renders the heading as a small mono eyebrow beside the number.
   * "display" renders it as the section's large headline — use this instead
   * of hiding the heading and repeating the same words in a <p>, which makes
   * screen readers announce the line twice.
   */
  titleVariant?: "label" | "display";
  className?: string;
};

/**
 * Shared section shell: a hairline rule with the mono number and title above
 * the content, matching the framing established in the hero.
 */
export function Section({
  id,
  number,
  title,
  children,
  hideTitle = false,
  titleVariant = "label",
  className = "",
}: SectionProps) {
  const isDisplay = titleVariant === "display";

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      // Vertical padding halved from py-20/28/36: sections sat 160px apart on
      // phones and 288px on desktop, which read as empty gaps.
      className={`mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16 lg:py-20 ${className}`}
    >
      <div className="mb-8 md:mb-12">
        <DrawnRule className="mb-4" />
        <Reveal className="flex items-baseline gap-4">
          <SectionNumber value={number} />
          {!isDisplay && (
            <h2
              id={`${id}-heading`}
              className={
                hideTitle ? "sr-only" : "label !text-[var(--text-muted)]"
              }
            >
              {title}
            </h2>
          )}
        </Reveal>

        {isDisplay && (
          <Reveal index={1}>
            <h2
              id={`${id}-heading`}
              className="mt-6 max-w-3xl text-balance text-3xl leading-[1.12] tracking-[-0.02em] sm:text-4xl md:text-5xl"
            >
              {title}
            </h2>
          </Reveal>
        )}
      </div>
      {children}
    </section>
  );
}
