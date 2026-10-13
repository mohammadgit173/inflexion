"use client";

import { useEffect, useRef } from "react";
import { trackBooking } from "@/components/analytics";

/**
 * Reports the conversion once, when the confirmation page is reached.
 *
 * Kept separate from the page so the page itself stays server-rendered, and
 * separate from the booking section so a booking still counts when Calendly
 * redirects here directly — the email confirmation link, or a visitor who
 * booked from Calendly's own page rather than the embed.
 */
export function BookingTracked() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackBooking("confirmation_page");
  }, []);

  return null;
}
