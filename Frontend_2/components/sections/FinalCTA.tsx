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
      {/* Ribbon terminus - both ribbons converge here */}
      <span
        data-ribbon-end
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-px w-px -translate-x-1/2 -translate-y-1/2 opacity-0"
      />
      <div className="ember-field" aria-hidden="true" />

      <div
        className="relative z-10 flex flex-col items-center px-10 py-14"
        style={{ backgroundColor: "rgba(18,17,18,0.82)" }}
      >
        <Reveal>
          <p className="label-mono">[ 05 / START ]</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="display h-hero mt-8 max-w-[16ch] text-white">
            Tell us what&apos;s <em data-ribbon-kw className="em em-kinetic">slowing</em> your business down.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-ash">
            We&apos;ll reply within 24 hours with how we&apos;d approach it. Plainly, with
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
              href="mailto:innocooks@gmail.com"
              className="label-mono label-mono--ash transition-none hover:text-kinetic"
            >
              or write to innocooks@gmail.com
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
