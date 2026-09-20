import { useTranslations } from "next-intl";
import { Section } from "@/components/primitives/section";
import { Reveal } from "@/components/primitives/reveal";

export type Testimonial = {
  quote: string;
  firstName: string;
  /** e.g. "Secondaire 5" */
  context: string;
  /** true when the quote is from a parent rather than the student */
  parent?: boolean;
};

/**
 * 007 — Testimonials.
 *
 * Nothing here is invented. The component reads `testimonials.items` from the
 * locale files, which ship as an empty array, and renders NOTHING AT ALL —
 * no heading, no rule, no spacing — until real quotes are added.
 *
 * Shape to add, per entry:
 *   { "quote": "…", "firstName": "…", "context": "Secondaire 5", "parent": false }
 */
export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Testimonial[];

  if (!Array.isArray(items) || items.length === 0) return null;

  const single = items.length === 1;

  return (
    <Section id="testimonials" number={t("sectionNumber")} title={t("title")}>
      <ul
        className={
          single
            ? "mx-auto max-w-3xl"
            : "grid grid-cols-1 gap-px bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {items.map((item, i) => (
          <Reveal key={`${item.firstName}-${i}`} index={i} as="li">
            <figure
              className={
                single
                  ? "text-center"
                  : "h-full bg-[var(--bg)] p-6 sm:p-8"
              }
            >
              <blockquote
                className={
                  single
                    ? "text-pretty text-2xl leading-[1.3] tracking-[-0.01em] sm:text-3xl"
                    : "text-pretty text-base leading-relaxed sm:text-lg"
                }
              >
                {item.quote}
              </blockquote>
              <figcaption className="mono mt-6 text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                {item.firstName}
                {item.context ? ` · ${item.context}` : ""}
                {item.parent ? ` · ${t("parentLabel")}` : ""}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
