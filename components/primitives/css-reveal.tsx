import type { CSSProperties, ReactNode } from "react";

type Tag = "div" | "p" | "span" | "li";

type CssRevealProps = {
  children: ReactNode;
  /** Stagger index — each step delays by 60ms. */
  index?: number;
  className?: string;
  as?: Tag;
};

/**
 * The above-the-fold counterpart to <Reveal>.
 *
 * Deliberately NOT a client component and deliberately not motion-driven: a
 * JS reveal cannot start until React has hydrated, which delayed the hero's
 * LCP to 5.4s. This runs from the stylesheet, so the animation's first frame
 * lands with the first paint and the text counts as painted immediately.
 *
 * prefers-reduced-motion is handled globally in globals.css, which collapses
 * the duration and delay so the element simply appears.
 */
export function CssReveal({
  children,
  index = 0,
  className = "",
  as: Tag = "div",
}: CssRevealProps) {
  return (
    <Tag
      className={`reveal-in ${className}`}
      style={{ "--reveal-delay": `${index * 60}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Hairline rule that draws left-to-right, CSS-driven for the same reason. */
export function CssRule({
  index = 0,
  className = "",
}: {
  index?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`rule-draw block h-px w-full bg-[var(--hairline)] ${className}`}
      style={{ "--reveal-delay": `${index * 60}ms` } as CSSProperties}
    />
  );
}
