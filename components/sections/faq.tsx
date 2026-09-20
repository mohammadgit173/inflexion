"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/primitives/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Item = { q: string; a: string };

/**
 * 008 — FAQ. Questions whose answer is still an empty string in the locale
 * file (rates, cancellation) are skipped entirely rather than rendered with a
 * visible placeholder. Fill the answer in and the item appears.
 */
export function Faq() {
  const t = useTranslations("faq");
  const items = (t.raw("items") as Item[]).filter(
    (item) => item.a.trim().length > 0,
  );

  if (items.length === 0) return null;

  return (
    <Section id="faq" number={t("sectionNumber")} title={t("title")}>
      <Accordion
        type="single"
        collapsible
        className="max-w-3xl border-t border-[var(--hairline)]"
      >
        {items.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
