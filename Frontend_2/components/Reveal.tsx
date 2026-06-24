"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Fade-rise reveal, fires once on viewport entry.
 *  Content stays fully visible for crawlers, no-JS and reduced-motion users -
 *  the hidden state is only ever applied inside the motion media query. */
export default function Reveal({ children, className, delay = 0, y = 22 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          delay,
          scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
        }
      );
    });
    return () => mm.revert();
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
