"use client";

import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/primitives/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  defaultRegionForLocale,
  useRegion,
  writeRegion,
} from "@/components/primitives/use-region";
import { type Region } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: string; items: string[] };
type RegionBlock = { id: Region; label: string; tabs: Tab[] };

/**
 * 004 — What we teach.
 *
 * The same mathematics has different names depending on where you study it:
 * Secondary 5 SN and the Ministry exam in Quebec, Grade 12 and AP Calculus
 * almost everywhere else. Showing a Quebec-only list to a student in Ontario
 * or abroad reads as "not for you", so both lists exist and the page picks
 * one.
 *
 * Which one is chosen from the region cookie the proxy sets from geolocation,
 * not from the language, because the two do not line up: an English-speaking
 * student at Dawson is in the Quebec system.
 *
 * Both lists stay in the markup and only the inactive one is hidden, so a
 * search for "AP Calculus tutor" and a search for "tuteur calcul cégep" can
 * both find this page. The server renders the locale's likely region first,
 * so the common case never swaps after load.
 */
export function Subjects() {
  const t = useTranslations("subjects");
  const regions = t.raw("regions") as RegionBlock[];

  const region = useRegion(defaultRegionForLocale(useLocale()));

  return (
    <Section id="subjects" number={t("sectionNumber")} title={t("title")}>
      <div
        role="group"
        aria-label={t("regionLabel")}
        className="mb-8 flex items-center gap-1"
      >
        {regions.map((block) => {
          const active = block.id === region;
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => writeRegion(block.id)}
              aria-pressed={active}
              className={cn(
                "mono cursor-pointer px-3 py-1.5 text-[0.6875rem] uppercase tracking-[0.14em] transition-colors",
                active
                  ? "text-[var(--text)] underline decoration-[var(--accent)] decoration-1 underline-offset-[6px]"
                  : "text-[var(--text-faint)] hover:text-[var(--text-muted)]",
              )}
            >
              {block.label}
            </button>
          );
        })}
      </div>

      {regions.map((block) => (
        <div key={block.id} hidden={block.id !== region}>
          <Tabs defaultValue={block.tabs[0]?.id}>
            <TabsList aria-label={`${t("title")} — ${block.label}`}>
              {block.tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {block.tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <ul className="max-w-2xl">
                  {tab.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-5 border-b border-[var(--hairline-soft)] py-5 first:border-t"
                    >
                      <span
                        aria-hidden="true"
                        className="mono pt-1 text-xs text-[var(--text-faint)]"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-pretty text-base leading-relaxed sm:text-lg">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      ))}
    </Section>
  );
}
