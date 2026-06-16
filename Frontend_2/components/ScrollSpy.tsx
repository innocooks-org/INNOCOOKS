"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "build", label: "What we build" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "studio", label: "Studio" },
  { id: "start", label: "Start" },
];

/** Right-edge section index that lights the section currently crossing the
 *  viewport's middle. Renders nothing unless the target sections exist (so it
 *  only appears on the homepage), and only on wide screens. */
export default function ScrollSpy() {
  const [present, setPresent] = useState<typeof SECTIONS>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const found = SECTIONS.filter((s) => document.getElementById(s.id));
    if (found.length === 0) return;
    setPresent(found);
    setActive(found[0].id);

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    found.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  if (present.length === 0) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 xl:flex"
    >
      {present.map((s, i) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group flex items-center justify-end gap-3"
            aria-current={on ? "true" : undefined}
          >
            <span
              className={`font-mono text-[0.62rem] uppercase tracking-[0.16em] transition-all duration-300 ${
                on ? "text-kinetic opacity-100" : "text-ash opacity-0 group-hover:opacity-100"
              }`}
            >
              {String(i + 1).padStart(2, "0")} {s.label}
            </span>
            <span
              className={`h-px transition-all duration-300 ${
                on ? "w-8 bg-kinetic" : "w-4 bg-ash-dim group-hover:bg-ash"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
