import { useTranslations } from "next-intl";
import { formatEventDate, type InflexionEvent } from "@/lib/events";
import type { Locale } from "@/i18n/routing";
import { calendarUrl } from "@/lib/calendar";
import {
  buttonBase,
  buttonVariants,
  Corners,
} from "@/components/primitives/bracket-button";

/**
 * One event, rendered as a technical drawing of itself: the date as a plate
 * on the left, the specification in the middle, how to join underneath.
 *
 * No ticket and no registration — the session is open, so the page's job is
 * to say what it is, when it is, and give one link. Entirely server-rendered:
 * there is nothing here that needs client JavaScript.
 */
export function EventEntry({
  event,
  locale,
}: {
  event: InflexionEvent;
  locale: Locale;
}) {
  const t = useTranslations("events");
  const when = formatEventDate(event, locale);
  const duration = event.durationMaxMinutes
    ? t("durationRange", {
        min: event.durationMinutes,
        max: event.durationMaxMinutes,
      })
    : t("durationSingle", { min: event.durationMinutes });

  return (
    <article className="relative border border-[var(--hairline)]">
      {/* Corner brackets on the frame, as on the hero and the portrait. */}
      <span aria-hidden="true">
        {[
          "-left-px -top-px border-l border-t",
          "-right-px -top-px border-r border-t",
          "-bottom-px -left-px border-b border-l",
          "-bottom-px -right-px border-b border-r",
        ].map((corner) => (
          <span
            key={corner}
            className={`pointer-events-none absolute h-4 w-4 border-[var(--accent)] ${corner}`}
          />
        ))}
      </span>

      <div className="grid gap-px bg-[var(--hairline)] md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        {/* Date plate */}
        <div className="flex flex-col justify-between gap-8 bg-[var(--bg)] p-7 sm:p-9">
          <div>
            <p className="mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
              {when.weekday}
            </p>
            <p className="mt-3 text-6xl leading-none tracking-[-0.03em] sm:text-7xl">
              {when.day}
            </p>
            <p className="mt-2 text-lg text-[var(--text-muted)]">
              {when.month} {when.year}
            </p>
            <p className="mono mt-5 text-xs text-[var(--accent-text)]">
              {when.time}
            </p>
          </div>

          <dl className="space-y-3">
            <div>
              <dt className="mono text-[0.625rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                {t("durationLabel")}
              </dt>
              <dd className="mt-1 text-sm text-[var(--text-muted)]">
                {duration}
              </dd>
            </div>
            <div>
              <dt className="mono text-[0.625rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                {t("priceLabel")}
              </dt>
              <dd className="mt-1 text-sm text-[var(--text-muted)]">
                {t("priceValue")}
              </dd>
            </div>
          </dl>
        </div>

        {/* Specification */}
        <div className="bg-[var(--bg)] p-7 sm:p-9">
          <h2 className="text-balance text-3xl tracking-[-0.02em] sm:text-4xl">
            {event.title[locale]}
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
            {event.tagline[locale]}
          </p>

          <div className="mt-7 space-y-4">
            {event.description[locale].map((paragraph, i) => (
              <p
                key={i}
                className="text-pretty text-[0.9375rem] leading-relaxed text-[var(--text-muted)]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <dl className="mt-8 border-t border-[var(--hairline-soft)]">
            {event.facts[locale].map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col gap-1 border-b border-[var(--hairline-soft)] py-3 sm:flex-row sm:gap-6"
              >
                <dt className="mono w-32 shrink-0 text-[0.625rem] uppercase tracking-[0.14em] text-[var(--text-faint)] sm:pt-1">
                  {fact.label}
                </dt>
                <dd className="text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* How to join */}
      <div className="border-t border-[var(--hairline)] p-7 sm:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <p className="mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
              {t("joinLabel")}
            </p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">
              {event.joinUrl ? t("joinReady") : t("joinPending")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {event.joinUrl ? (
              <a
                href={event.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonBase} ${buttonVariants.solid}`}
              >
                <Corners />
                {t("join")}
              </a>
            ) : null}

            {/* Worth having either way: the calendar entry is how someone
                who finds this page three weeks early actually turns up. */}
            <a
              href={calendarUrl(event, locale)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonBase} ${event.joinUrl ? buttonVariants.outline : buttonVariants.solid}`}
            >
              <Corners />
              {t("addToCalendar")}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
