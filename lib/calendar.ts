import type { InflexionEvent } from "@/lib/events";
import type { Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

/** YYYYMMDDTHHMMSSZ, the format Google Calendar expects. */
function stamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * A Google Calendar "add event" link.
 *
 * A link rather than an .ics download: it works on a phone without saving a
 * file, and Google Calendar is what most students here actually use. The
 * event's own page is included so the invitation carries a way back.
 */
export function calendarUrl(event: InflexionEvent, locale: Locale): string {
  const start = new Date(event.startsAt);
  const minutes = event.durationMaxMinutes ?? event.durationMinutes;
  const end = new Date(start.getTime() + minutes * 60_000);
  const path = locale === "fr" ? "/evenements" : "/en/events";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Inflexion — ${event.title[locale]}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: `${event.tagline[locale]}\n\n${SITE_URL}${path}`,
    ctz: "America/Toronto",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
