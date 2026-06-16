"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/* Custom kinetic cursor — a crosshair ring + centre dot that lerps toward the
 * pointer and swells over interactive elements. Desktop fine-pointers only and
 * never under reduced-motion (there the native cursor is left alone). */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    const xRing = gsap.quickTo(ring.current, "x", { duration: 0.4, ease: "power3.out" });
    const yRing = gsap.quickTo(ring.current, "y", { duration: 0.4, ease: "power3.out" });
    const xDot = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power2.out" });
    const yDot = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power2.out" });

    let visible = false;
    const move = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([ring.current, dot.current], { autoAlpha: 1, duration: 0.2 });
      }
      xRing(e.clientX);
      yRing(e.clientY);
      xDot(e.clientX);
      yDot(e.clientY);
    };

    const INTERACTIVE = "a, button, input, textarea, select, [data-cursor]";
    const over = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.(INTERACTIVE))
        ring.current?.setAttribute("data-active", "1");
    };
    const out = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.(INTERACTIVE))
        ring.current?.removeAttribute("data-active");
    };
    const leave = () => {
      visible = false;
      gsap.to([ring.current, dot.current], { autoAlpha: 0, duration: 0.2 });
    };
    const down = () => ring.current?.setAttribute("data-press", "1");
    const up = () => ring.current?.removeAttribute("data-press");

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);

    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[120] -ml-3.5 -mt-3.5 h-7 w-7 border border-kinetic opacity-0 will-change-transform"
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[120] -ml-[2px] -mt-[2px] h-1 w-1 bg-kinetic opacity-0 will-change-transform"
      />
    </>
  );
}
