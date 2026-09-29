"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  defaultRegionForLocale,
  useRegion,
} from "@/components/primitives/use-region";

/**
 * The one sentence in the founder section that names where the students are.
 *
 * Quebec visitors see the Montreal number, which is the credential that means
 * something to them. Everyone else sees the same experience described without
 * a city, because "based in Montreal" reads as "not for you" to a student in
 * Texas or Dubai — and the reach is real either way.
 *
 * Split into its own client component so the rest of the founder section
 * stays server-rendered.
 */
export function ReachLine({ className }: { className?: string }) {
  const t = useTranslations("about");
  const region = useRegion(defaultRegionForLocale(useLocale()));
  return <span className={className}>{t(`reach.${region}`)}</span>;
}
