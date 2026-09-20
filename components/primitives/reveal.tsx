"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger index — each step delays by 60ms. */
  index?: number;
  className?: string;
  as?: "div" | "span" | "li" | "p";
  /**
   * Animate on mount instead of on scroll. Use for anything above the fold:
   * a scroll-triggered element that starts at opacity 0 stays invisible until
   * the viewport observer fires, which leaves the hero blank on first paint.
   */
  onMount?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

// Only the bottom edge is inset, so anything already on screen at load is
// unambiguously intersecting and fires immediately.
const VIEWPORT = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" };

/**
 * Fade + 12px rise, once per element.
 * Under prefers-reduced-motion the content renders plainly with no transform.
 */
export function Reveal({
  children,
  index = 0,
  className,
  as = "div",
  onMount = false,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const transition = {
    duration: 0.55,
    delay: index * 0.06,
    ease: EASE,
  };

  if (onMount) {
    return (
      <MotionTag
        className={className}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={transition}
    >
      {children}
    </MotionTag>
  );
}

/**
 * A hairline rule that draws itself left to right on entry.
 */
export function DrawnRule({
  className = "",
  onMount = false,
}: {
  className?: string;
  onMount?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const cls = `h-px w-full origin-left bg-[var(--hairline)] ${className}`;

  if (reduceMotion) {
    return <div aria-hidden="true" className={cls} />;
  }

  const anim = { scaleX: 1 };
  const transition = { duration: 0.9, ease: EASE };

  return (
    <motion.div
      aria-hidden="true"
      className={cls}
      initial={{ scaleX: 0 }}
      {...(onMount
        ? { animate: anim }
        : { whileInView: anim, viewport: VIEWPORT })}
      transition={transition}
    />
  );
}
