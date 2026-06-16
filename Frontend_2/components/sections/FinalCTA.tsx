"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";

export default function FinalCTA() {
  return (
    <section
      id="start"
      className="relative flex min-h-[90svh] flex-col items-center justify-center overflow-hidden bg-onyx px-5 py-28 text-center md:px-16"
    >
      <div className="ember-field" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center">
        <Reveal>
          <p className="label-mono">[ 05 / START ]</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="display h-hero mt-8 max-w-[16ch] text-white">
            Tell us what&apos;s <em className="em">slowing</em> your business down.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-ash">
            We&apos;ll reply within 24 hours with how we&apos;d approach it — plainly, with
            no jargon and no obligation.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-12 flex flex-col items-center gap-6">
            <Magnetic>
              <Link href="/contact/" className="btn-primary px-10 py-5 text-sm">
                Start the conversation <span aria-hidden="true">→</span>
              </Link>
            </Magnetic>
            <a
              href="mailto:vishnuuu24@gmail.com"
              className="label-mono label-mono--ash transition-none hover:text-kinetic"
            >
              or write to vishnuuu24@gmail.com
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
