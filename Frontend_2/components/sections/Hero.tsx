"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import Magnetic from "@/components/Magnetic";
import HeroCanvas from "@/components/HeroCanvas";
import LightTower from "@/components/LightTower";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        ".hero-line",
        { yPercent: 110 },
        { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.08 }
      );
      tl.fromTo(
        ".hero-up",
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 },
        "-=0.6"
      );

      // the wordmark recedes as you scroll past - depth
      gsap.to(".hero-stage", {
        yPercent: -10,
        autoAlpha: 0.2,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom 35%",
          scrub: 0.5,
        },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-screen flex-col justify-center md:justify-end overflow-hidden border-b border-iron px-5 pb-28 pt-24 md:px-16 md:pb-24 md:pt-32"
    >
      <div className="ember-field" aria-hidden="true" />
      <HeroCanvas />

      <div className="hero-stage container-x relative z-10 !px-0">
        <p className="hero-up label-mono mb-7">SYSTEMS STUDIO // COOKING INNOVATION</p>

        <h1 className="display h-hero max-w-[16ch] text-white">
          <span className="mask-rise block">
            <span className="hero-line">We build the</span>
          </span>
          <span className="mask-rise block">
            <span className="hero-line text-kinetic">websites, systems &amp; AI</span>
          </span>
          <span className="mask-rise block">
            <span className="hero-line">your business runs on.</span>
          </span>
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
          <p className="hero-up max-w-md text-lg leading-relaxed text-ash">
            Crafted like products, not projects. Maintained long after launch,
            so they keep earning their keep.
          </p>
          <div className="hero-up flex flex-wrap gap-3">
            <Magnetic>
              <Link href="/contact/" className="btn-primary">
                Start a project <span aria-hidden="true">→</span>
              </Link>
            </Magnetic>
            <Magnetic strength={0.15}>
              <Link href="/#work" className="btn-ghost">
                See the work
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="hero-up absolute bottom-5 left-1/2 z-0 flex -translate-x-1/2 flex-col items-center gap-2">
        <LightTower />
        <span className="label-mono label-mono--ash">SCROLL</span>
      </div>
    </section>
  );
}
