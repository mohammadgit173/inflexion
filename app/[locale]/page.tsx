import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/hero";
import { Problem } from "@/components/sections/problem";
import { Approach } from "@/components/sections/approach";
import { Subjects } from "@/components/sections/subjects";
import { Process } from "@/components/sections/process";
import { Founder } from "@/components/sections/founder";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { Booking } from "@/components/sections/booking";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  /*
   * FAQ structured data, so the questions can appear directly in search
   * results. Built from the same locale entries the section renders, and
   * filtered the same way, so the markup can never advertise an answer the
   * page doesn't show (rates and cancellation stay out while blank).
   */
  const tFaq = await getTranslations({ locale, namespace: "faq" });
  const answered = (tFaq.raw("items") as { q: string; a: string }[]).filter(
    (item) => item.a.trim().length > 0,
  );
  const faqLd =
    answered.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: answered.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  return (
    <>
      {faqLd && (
        <script
          type="application/ld+json"
          // Values come from our own locale files, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <Hero />
      <Problem />
      <Approach />
      <Subjects />
      <Process />
      <Founder />
      {/* Renders nothing while the testimonials array is empty. */}
      <Testimonials />
      <Faq />
      <Booking />
    </>
  );
}
