"use client";

/* InnoCooks — FinalCTA ("Start")
 * The closing moment: the vertical Spine reaches bottom and <ClosingSpine>
 * curls a gold loop around the CTA — the only closure on the page. The button
 * is magnetic (ClosingSpine drives [data-cta]'s transform) and a bead runs the
 * loop once it shuts. Drop-in replacement for the old FinalCTA.tsx.
 *
 * NOTE: id="start" is required — ClosingSpine reads it to anchor the spine's
 * bottom and the loop. Keep the [data-loop] wrapper and [data-cta] on the link.
 */

import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function FinalCTA() {
  return (
    <section id="start" className="relative overflow-hidden bg-dusk text-cream">
      <div className="glow-field" aria-hidden="true" />
      <div className="container-x relative flex min-h-[100svh] flex-col items-center justify-center py-28 text-center md:py-32">
        <Reveal>
          <p className="label-mono text-gold">/ 05 — Start</p>
          <h2 className="display mt-8 max-w-[20ch] text-[clamp(2.2rem,5.2vw,4.2rem)]">
            Tell us what&apos;s slowing your business down.
          </h2>
          <p className="mx-auto mt-7 max-w-md leading-relaxed text-mist">
            We&apos;ll reply within 24 hours with how we&apos;d approach it — plainly, with
            no jargon and no obligation.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          {/* the loop anchor — ClosingSpine draws the closing circle around this */}
          <div className="mt-14 inline-flex" data-loop>
            <Link
              href="/contact/"
              data-cta
              className="btn-gold px-10 py-4 text-base will-change-transform"
            >
              Start the conversation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <a
            href="mailto:vishnuuu24@gmail.com"
            className="mt-10 font-mono text-xs uppercase tracking-[0.16em] text-mist transition-colors duration-300 hover:text-cream"
          >
            or write to vishnuuu24@gmail.com
          </a>
        </Reveal>
      </div>
    </section>
  );
}
