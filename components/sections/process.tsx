"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Section } from "@/components/primitives/section";
import { Reveal } from "@/components/primitives/reveal";

type Step = { number: string; title: string; body: string };

/**
 * 005 — How it works. A vertical rail whose filled portion is driven by the
 * section's own scroll progress, so the connecting line draws itself as the
 * steps come into view.
 */
export function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];
  const reduceMotion = useReducedMotion();
  const railRef = useRef<HTMLOListElement>(null);

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.85", "end 0.6"],
  });

  // Spring removes the jitter of raw scroll progress without adding lag.
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <Section id="process" number={t("sectionNumber")} title={t("title")}>
      <ol ref={railRef} className="relative max-w-3xl">
        {/* Unfilled rail */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-[7px] top-2 w-px bg-[var(--hairline)]"
        />
        {/* Filled rail — scales from the top as the section scrolls past */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-[7px] top-2 w-px origin-top bg-[var(--accent)]"
          style={{ scaleY: reduceMotion ? 1 : progress }}
        />

        {steps.map((step, i) => (
          <li key={step.number} className="relative pb-14 pl-12 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 block h-[15px] w-[15px] border border-[var(--border-interactive)] bg-[var(--bg)]"
            />
            <Reveal index={i}>
              <p className="mono text-xs text-[var(--text-faint)]">
                {step.number}
              </p>
              <h3 className="mt-4 text-xl tracking-[-0.01em] sm:text-2xl">
                {step.title}
              </h3>
              <p className="mt-3 max-w-xl text-pretty text-[0.9375rem] leading-relaxed text-[var(--text-muted)] sm:text-base">
                {step.body}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
