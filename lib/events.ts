import type { Locale } from "@/i18n/routing";

/** Text that exists in both languages. */
export type Bilingual = Record<Locale, string>;

export type InflexionEvent = {
  slug: string;
  /** ISO 8601 with an explicit offset, so the hour is unambiguous. */
  startsAt: string;
  /** Minutes. Shown as a range when `durationMaxMinutes` is set. */
  durationMinutes: number;
  durationMaxMinutes?: number;
  title: Bilingual;
  /** One sentence under the title. */
  tagline: Bilingual;
  description: Record<Locale, string[]>;
  /** Short facts rendered as a spec list: audience, format, language. */
  facts: Record<Locale, { label: string; value: string }[]>;
  /**
   * Where people join. Open to anyone, no ticket and no registration.
   *
   * Leave it out until the room exists and the page says the link will be
   * posted here instead — better than a button that goes nowhere.
   */
  joinUrl?: string;
};

/**
 * Upcoming events, sorted by date at render.
 *
 * Everything an event needs lives here: the date, the copy in both
 * languages, and the link to join. Adding an event is adding an object.
 */
export const EVENTS: InflexionEvent[] = [
  {
    slug: "calculus-midterm-rescue",
    // 2:00 PM Eastern on Sunday, October 18, 2026. -04:00 is EDT; Quebec is
    // still on daylight time in mid-October.
    startsAt: "2026-10-18T14:00:00-04:00",
    durationMinutes: 60,
    durationMaxMinutes: 90,
    title: {
      fr: "Sauvetage Calcul — Mi-session",
      en: "Calculus Midterm Rescue",
    },
    tagline: {
      fr: "Une séance de 90 minutes sur ce qui fait tomber les gens à l'examen de mi-session.",
      en: "Ninety minutes on the things that actually cost people marks at the midterm.",
    },
    description: {
      fr: [
        "On reprend les idées qui reviennent à chaque mi-session de calcul différentiel : limites et continuité, la définition de la dérivée, les règles de dérivation et les taux de variation liés.",
        "Pas un survol du plan de cours. On travaille les endroits précis où les questions d'examen piègent les gens, et on explique pourquoi la méthode fonctionne — pas seulement quoi écrire.",
        "La séance est bilingue : les explications se donnent en français, et les questions en anglais sont les bienvenues.",
      ],
      en: [
        "We work through what shows up on every differential calculus midterm: limits and continuity, the definition of the derivative, the differentiation rules, and related rates.",
        "Not a tour of the syllabus. We go at the exact places exam questions trip people up, and why the method works — not just what to write down.",
        "The session is bilingual: ask your question in French or English, whichever you think in.",
      ],
    },
    facts: {
      fr: [
        { label: "Pour", value: "Cégep (Calcul différentiel) et Calcul 1 à l'université" },
        { label: "Format", value: "En ligne, en direct, avec période de questions" },
        { label: "Langue", value: "Bilingue — français et anglais" },
        { label: "Accès", value: "Gratuit et ouvert à tous, sans inscription" },
      ],
      en: [
        { label: "For", value: "CEGEP (Calcul différentiel) and first-year university Calculus 1" },
        { label: "Format", value: "Online, live, with open Q&A" },
        { label: "Language", value: "Bilingual — French and English" },
        { label: "Access", value: "Free and open to everyone, no sign-up" },
      ],
    },
    // joinUrl: paste the meeting or stream link here once the room exists.
  },
];

/** Events that have not finished yet, soonest first. */
export function upcomingEvents(now = new Date()): InflexionEvent[] {
  return EVENTS.filter((event) => {
    const end = new Date(event.startsAt).getTime();
    const minutes = event.durationMaxMinutes ?? event.durationMinutes;
    return end + minutes * 60_000 > now.getTime();
  }).sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function findEvent(slug: string): InflexionEvent | undefined {
  return EVENTS.find((event) => event.slug === slug);
}

/**
 * The event's date and time, always rendered in Eastern time.
 *
 * Fixing the timezone matters: without it the server renders UTC and the
 * browser renders the visitor's zone, so the two disagree and React reports a
 * hydration mismatch — and a student in Vancouver would see the wrong hour.
 */
export function formatEventDate(event: InflexionEvent, locale: Locale) {
  const date = new Date(event.startsAt);
  const tag = locale === "fr" ? "fr-CA" : "en-CA";
  const zone = "America/Toronto";

  return {
    weekday: new Intl.DateTimeFormat(tag, {
      weekday: "long",
      timeZone: zone,
    }).format(date),
    day: new Intl.DateTimeFormat(tag, { day: "numeric", timeZone: zone }).format(
      date,
    ),
    month: new Intl.DateTimeFormat(tag, { month: "long", timeZone: zone }).format(
      date,
    ),
    year: new Intl.DateTimeFormat(tag, {
      year: "numeric",
      timeZone: zone,
    }).format(date),
    time: new Intl.DateTimeFormat(tag, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: zone,
      timeZoneName: "short",
    }).format(date),
  };
}
