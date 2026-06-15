"use client";

/* InnoCooks — Services ("What we build")
 * A scroll-linked word reveal, à la the references the studio loves. A bold
 * manifesto sits dim; as you scroll, each word ignites in sequence — the four
 * capability words (websites / systems / AI / automation) light up in gold,
 * the rest in ink — so the page reads itself aloud. Below it, the four names
 * as a quiet index line.
 *
 * Mechanic: GSAP scrubs each word's OPACITY from dim→1 with a stagger, mapped
 * to the section's scroll range. Opacity is compositor-cheap (no per-frame paint
 * storm), keyword colour is static (gold vs ink), and there's no pin or canvas.
 * The text is real and fully in the DOM; reduced-motion / no-JS render it lit.
 */

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import Reveal from "@/components/Reveal";

const SENTENCE =
  "We build the websites that turn visitors into customers, the systems that end your spreadsheet chaos, the AI that handles the repetitive thinking, and the automation that runs the busywork itself.";

const KEYS = new Set(["websites", "systems", "ai", "automation"]);
const WORDS = SENTENCE.split(" ").map((w) => ({
  w,
  key: KEYS.has(w.replace(/[^A-Za-z]/g, "").toLowerCase()),
}));

const INDEX = ["Websites", "Systems", "AI", "Automation"];

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const stmtRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = gsap.utils.toArray<HTMLElement>(".hl-word", stmtRef.current);
      gsap.fromTo(
        words,
        { opacity: 0.12, yPercent: 28 },
        {
          opacity: 1,
          yPercent: 0,
          ease: "power2.out",
          stagger: 0.5,
          duration: 0.6,
          scrollTrigger: {
            trigger: stmtRef.current,
            start: "top 78%",
            end: "bottom 72%",
            scrub: 0.6,
          },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="services" className="relative scroll-mt-24 bg-parch text-ink">
      <div className="container-x py-28 md:py-40">
        <Reveal>
          <p className="label-mono">/ 01 — What we build</p>
        </Reveal>

        <p
          ref={stmtRef}
          className="display mt-10 max-w-[24ch] text-[clamp(1.9rem,5.4vw,4.4rem)] leading-[1.12] md:mt-12"
        >
          {WORDS.map(({ w, key }, i) => (
            <Fragment key={i}>
              <span className="hl-word" data-key={key ? 1 : 0}>
                {w}
              </span>
              {i < WORDS.length - 1 ? " " : null}
            </Fragment>
          ))}
        </p>

        {/* the four, as a quiet index line */}
        <Reveal delay={0.1}>
          <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-gold-deep/20 pt-7 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-gold-deep md:mt-20 md:gap-x-12">
            {INDEX.map((label, i) => (
              <li key={label} className="flex items-center gap-3">
                <span className="text-muted">{String(i + 1).padStart(2, "0")}</span>
                {label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
