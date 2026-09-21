import { useTranslations } from "next-intl";
import { Section } from "@/components/primitives/section";
import { Reveal } from "@/components/primitives/reveal";

type Pillar = { number: string; title: string; body: string };

/**
 * 003 — The approach. Three bordered cells, mono numbers, no shadows.
 * Borders are drawn per-edge so adjacent cells share a single hairline.
 */
export function Approach() {
  const t = useTranslations("approach");
  const pillars = t.raw("pillars") as Pillar[];

  return (
    <Section id="approach" number={t("sectionNumber")} title={t("title")}>
      <ul className="grid grid-cols-1 border-t border-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar, i) => (
          <Reveal key={pillar.number} index={i} as="li">
            <div
              className={[
                "group relative h-full border-b border-[var(--hairline)] p-6 sm:p-8",
                // Vertical rules only between columns, so the stacked phone
                // layout keeps a single horizontal rhythm. 2x2 from sm: the
                // right-hand column (odd items) gets a left rule. Four across
                // from lg: every item after the first does.
                i % 2 === 1 ? "sm:border-l" : "",
                i > 0 ? "lg:border-l" : "",
                "transition-colors duration-300 hover:bg-[var(--accent-soft)]",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-[var(--accent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <p className="mono text-xs text-[var(--text-faint)]">
                {pillar.number}
              </p>
              <h3 className="mt-6 text-xl tracking-[-0.01em] sm:text-2xl">
                {pillar.title}
              </h3>
              <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">
                {pillar.body}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
