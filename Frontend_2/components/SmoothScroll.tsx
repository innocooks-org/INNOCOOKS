"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePathname, useSearchParams } from "next/navigation";

/** Lenis smooth scroll — desktop pointer devices only, never on touch,
 *  never when the user prefers reduced motion. */
export default function SmoothScroll() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lenisInst, setLenisInst] = useState<Lenis | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const lenis = new Lenis({ duration: 1.05 });
    setLenisInst(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenisInst(null);
    };
  }, []);

  // Force scroll to top on route change (Next.js Link doesn't reset Lenis automatically)
  useEffect(() => {
    // If there's a hash in the URL, let the browser or Next.js handle jumping to it
    if (window.location.hash) return;

    if (lenisInst) {
      lenisInst.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, searchParams, lenisInst]);

  return null;
}
