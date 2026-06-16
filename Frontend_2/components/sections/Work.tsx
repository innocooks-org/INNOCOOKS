"use client";

/* ARCHIVE — a horizontal, drag-to-explore rail of selected work. Each card
 * carries an art-directed, drawn "mock" (zero raster weight) that warms from
 * grayscale to kinetic on hover. Christalin opens its case study; the rest open
 * live in a new tab. Drag is a desktop enhancement; touch scrolls natively. */

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/* ── drawn mocks ───────────────────────────────────────────── */
function ChristalinMock() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2 overflow-hidden bg-onyx-raise">
      {[...Array(7)].map((_, i) => (
        <span
          key={i}
          className="h-2/3 w-6 bg-gradient-to-b from-white/20 to-transparent"
          style={{ transform: `translateY(${(i % 2 ? 1 : -1) * 12}px)` }}
        />
      ))}
      <span className="absolute h-40 w-40 rotate-45 border border-white/30" />
    </div>
  );
}
function EditsMock() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-onyx-raise">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/30">
        <svg viewBox="0 0 14 16" className="ml-1 h-7 w-7 fill-white/70" aria-hidden="true">
          <path d="M0 0 L14 8 L0 16 Z" />
        </svg>
      </div>
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className="absolute inset-x-0 h-px bg-white/10"
          style={{ top: `${15 + i * 14}%` }}
        />
      ))}
    </div>
  );
}
function HackstersMock() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden bg-onyx-raise px-10 font-mono text-xs text-white/40">
      <p>~ hacksters.tech</p>
      <p>$ build --production</p>
      <p>→ shipped. innovators of tomorrow.</p>
      <span className="mt-2 inline-block h-4 w-2 animate-pulse bg-kinetic" />
    </div>
  );
}

type Project = {
  title: string;
  kind: string;
  status: string;
  year: string;
  desc: string;
  href: string;
  external: boolean;
  cta: string;
  Mock: () => ReactNode;
};

const projects: Project[] = [
  {
    title: "Christalin Mirrors",
    kind: "Website + Systems",
    status: "Live in production",
    year: "2025",
    desc: "A refined unisex salon whose site now matches the room. Live under an annual care plan — multi-branch operating systems next.",
    href: "/work/christalin-mirrors/",
    external: false,
    cta: "Case study",
    Mock: ChristalinMock,
  },
  {
    title: "The Edits Club",
    kind: "Brand + Portfolio",
    status: "Live",
    year: "2025",
    desc: "Brand and portfolio for a video editing studio — built to let the work play front and centre, premium on any screen.",
    href: "https://theeditsclub.in",
    external: true,
    cta: "Visit ↗",
    Mock: EditsMock,
  },
  {
    title: "Hacksters",
    kind: "Studio Platform",
    status: "Live",
    year: "2026",
    desc: "An interactive studio platform for a collective of builders — fast, expressive, engineered to feel alive while staying production-solid.",
    href: "https://hacksters.tech",
    external: true,
    cta: "Visit ↗",
    Mock: HackstersMock,
  },
];

export default function Work() {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, scroll: 0, moved: 0 });

  const onDown = (e: React.PointerEvent) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = rail.current!;
    drag.current = { down: true, startX: e.clientX, scroll: el.scrollLeft, moved: 0 };
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    rail.current!.scrollLeft = drag.current.scroll - dx;
  };
  const onUp = (e: React.PointerEvent) => {
    drag.current.down = false;
    rail.current?.releasePointerCapture(e.pointerId);
  };
  // suppress the click that ends a drag
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section id="work" className="relative scroll-mt-24 border-b border-iron bg-onyx py-24 md:py-32">
      <div className="container-x flex items-end justify-between gap-6">
        <div>
          <p className="label-mono">[ 02 / SELECTED_WORK ]</p>
          <h2 className="display h-xl mt-5 text-white">
            Built by us.
            <br />
            Used for <em className="em">real</em>.
          </h2>
        </div>
        <span className="label-mono label-mono--ash mb-2 hidden md:block">
          {projects.length} projects // drag to explore
        </span>
      </div>

      <div
        ref={rail}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onClickCapture={onClickCapture}
        className="no-scrollbar mt-12 flex snap-x gap-px overflow-x-auto px-5 md:cursor-grab md:px-16 md:active:cursor-grabbing"
      >
        {projects.map((p, i) => {
          const cls =
            "group relative flex h-[480px] min-w-[85vw] snap-center flex-col justify-between border border-iron bg-onyx p-7 transition-none hover:border-kinetic md:min-w-[560px] md:p-9";
          const inner = (
            <>
              {/* drawn mock */}
              <div className="absolute inset-0 z-0 opacity-25 grayscale transition-[opacity,filter] duration-300 group-hover:opacity-100 group-hover:grayscale-0">
                <p.Mock />
              </div>
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-onyx via-onyx/70 to-transparent" />

              {/* top meta */}
              <div className="relative z-10 flex items-start justify-between">
                <span className="label-mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="label-mono label-mono--ash">{p.year}</span>
              </div>

              {/* bottom content */}
              <div className="relative z-10">
                <p className="label-mono label-mono--ash mb-3">{p.kind}</p>
                <h3 className="display h-lg text-white transition-none group-hover:text-kinetic">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-ash">{p.desc}</p>
                <div className="mt-6 flex items-center justify-between border-t border-iron pt-4">
                  <span className="label-mono label-mono--ash">{p.status}</span>
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-white transition-none group-hover:text-kinetic">
                    {p.cta} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </>
          );

          return p.external ? (
            <a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>
              {inner}
            </a>
          ) : (
            <Link key={p.title} href={p.href} className={cls}>
              {inner}
            </Link>
          );
        })}
        {/* trailing spacer so the last card can snap clear of the edge */}
        <span className="min-w-[1px] shrink-0" aria-hidden="true" />
      </div>
    </section>
  );
}
