"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/** First-visit boot sequence: a mono counter runs 00→100, a kinetic bar fills,
 *  then the shutter snaps up. ≤1.3s, overlays already-rendered content, skipped
 *  on repeat visits (sessionStorage) and for reduced-motion users. */
export default function Preloader() {
  const [show, setShow] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem("ic2-seen")) return;
    sessionStorage.setItem("ic2-seen", "1");
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show || !overlayRef.current) return;
    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({ onComplete: () => setShow(false) });

      tl.to(counter, {
        v: 100,
        duration: 1.0,
        ease: "power2.inOut",
        onUpdate: () => {
          if (countRef.current)
            countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
        },
      });
      tl.fromTo(".pre-bar", { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: "power2.inOut" }, 0);
      tl.to(".pre-fade", { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, ">-0.05");
      tl.to(overlayRef.current, {
        yPercent: -100,
        duration: 0.6,
        ease: "expo.inOut",
      }, "<0.05");
    }, overlayRef);
    return () => ctx.revert();
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-onyx px-5 py-5 md:px-16 md:py-8"
    >
      <div className="pre-fade flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/android-chrome-512x512-background-removed.png"
          alt="InnoCooks"
          className="h-8 w-auto brightness-0 invert"
        />
        <span className="label-mono label-mono--ash">BOOT_SEQUENCE</span>
      </div>

      {/* centred ghost logo - fades out with the rest */}
      <div className="pre-fade flex flex-1 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/android-chrome-512x512-background-removed.png"
          alt=""
          aria-hidden="true"
          className="w-36 brightness-0 invert opacity-15 md:w-48"
        />
      </div>

      <div className="pre-fade flex items-end justify-between">
        <span className="display h-hero leading-none text-white">
          <span ref={countRef}>000</span>
          <span className="text-kinetic">%</span>
        </span>
        <span className="label-mono mb-2 hidden md:block">LOADING_ASSETS</span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-px w-full origin-left scale-x-0 bg-kinetic pre-bar" />
        <div className="pre-fade flex items-center justify-between">
          <span className="label-mono label-mono--ash">COOKING INNOVATION</span>
          <span className="label-mono label-mono--ash">v2.0</span>
        </div>
      </div>
    </div>
  );
}
