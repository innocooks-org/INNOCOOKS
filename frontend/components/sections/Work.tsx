"use client";

/* InnoCooks — Work ("Selected work")
 * A Drive-style library of projects: a calm grid of tiles that grows naturally
 * as the work does. Click a tile and it expands into an in-page preview — one
 * screenshot, a short write-up and the links — closed by the X or Esc. No page
 * navigation, no horizontal-scroll carousel to outgrow.
 *
 * Each project draws its own art-directed mock now (zero raster weight); the
 * optional `image` slot lets a real screenshot drop straight in later with no
 * other change. Touch / reduced-motion still get the full grid + overlay; only
 * the open/close easing is decorative.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/* ── per-project art direction (drawn; swap for `image` when ready) ── */

function ChristalinMock() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-parch-soft px-8 text-ink">
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold-deep md:text-[10px]">Refined unisex salon</p>
      <p className="display text-2xl md:text-3xl">Christalin Mirrors</p>
      <span className="h-px w-20 bg-gold md:w-24" />
      <div className="mt-3 grid w-full max-w-sm grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-parch" />
        ))}
      </div>
      <div className="mt-1 h-8 w-32 rounded-full bg-ink" />
    </div>
  );
}

function EditsClubMock() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#15100c] px-8 text-[#e8d9c4]">
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#a47b5a] md:text-[10px]">Visual storytelling</p>
      <p className="display text-2xl uppercase tracking-[0.1em] md:text-3xl">The Edits Club</p>
      <span className="h-px w-20 bg-[#a47b5a] md:w-24" />
      <div className="mt-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#a47b5a]">
        <svg viewBox="0 0 14 16" className="ml-0.5 h-4 w-4 fill-[#e8d9c4]" aria-hidden="true">
          <path d="M0 0 L14 8 L0 16 Z" />
        </svg>
      </div>
    </div>
  );
}

function HackstersMock() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3 bg-dusk-soft px-10 font-mono text-xs text-mist md:px-14">
      <p className="text-gold">~ hacksters.tech</p>
      <p><span className="text-cream">$</span> build --production</p>
      <p className="text-cream/80">→ shipped. innovators of tomorrow.</p>
      <div className="mt-4 flex flex-col gap-2">
        {[80, 60, 70].map((w, i) => (
          <span key={i} className="h-1.5 rounded-full bg-cream/15" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

type Project = {
  title: string;
  kind: string;          // short "file type" label, Drive-style
  tag: string;           // one-line summary on the tile
  description: string;   // the write-up shown in the preview
  href: string;
  external: boolean;
  cta: string;
  Mock: () => ReactNode;
  image?: string;        // drop a real screenshot path here later
};

const projects: Project[] = [
  {
    title: "Christalin Mirrors",
    kind: "Website + Systems",
    tag: "Live in production · systems for 7 branches next",
    description:
      "A refined unisex salon whose website didn't match the experience of walking through her doors. We designed and built it end-to-end, and it's now live under an annual care plan — with the multi-branch operating systems coming next.",
    href: "/work/christalin-mirrors/",
    external: false,
    cta: "Read the case study",
    Mock: ChristalinMock,
  },
  {
    title: "The Edits Club",
    kind: "Brand + Portfolio",
    tag: "Video editing studio",
    description:
      "Brand and portfolio site for a video editing studio — built to let the work play front and centre, with art direction that reads as premium on any screen.",
    href: "https://theeditsclub.in",
    external: true,
    cta: "Visit the live site",
    Mock: EditsClubMock,
  },
  {
    title: "Hacksters",
    kind: "Studio Platform",
    tag: "Interactive portfolio",
    description:
      "An interactive studio platform and portfolio for a collective of builders — fast, expressive, and engineered to feel alive while staying production-solid.",
    href: "https://hacksters.tech",
    external: true,
    cta: "Visit the live site",
    Mock: HackstersMock,
  },
];

function FileIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-gold" fill="none" aria-hidden="true">
      <path d="M3.5 1.5h5l4 4v9h-9z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8.5 1.5v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export default function Work() {
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const open = (i: number) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setActive(i);
    requestAnimationFrame(() => setShown(true));
  };

  const close = useCallback(() => {
    setShown(false);
    window.setTimeout(() => {
      setActive(null);
      lastFocus.current?.focus?.();
    }, 280);
  }, []);

  // esc to close + lock background scroll + move focus to the close button
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [active, close]);

  const p = active !== null ? projects[active] : null;

  return (
    <section id="work" className="relative z-[1] overflow-hidden bg-dusk text-cream">
      <div className="glow-field" aria-hidden="true" />
      <div className="container-x relative py-20 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="label-mono text-gold">/ 02 — Selected work</p>
            <h2 className="display mt-4 text-[clamp(2rem,4.5vw,3.6rem)] text-cream">
              Built by us. Used for real.
            </h2>
          </div>
          <p className="hidden font-mono text-xs uppercase tracking-[0.2em] text-mist md:block">
            {projects.length} projects · click to open
          </p>
        </div>

        {/* the Drive-style library */}
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj, i) => (
            <li key={proj.title}>
              <button
                type="button"
                onClick={() => open(i)}
                aria-haspopup="dialog"
                className="group block w-full overflow-hidden rounded-2xl border border-cream/10 bg-dusk-soft/40 text-left transition-[transform,border-color] duration-500 ease-[var(--ease-settle)] hover:-translate-y-1 hover:border-gold/60 focus-visible:border-gold/60"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-settle)] group-hover:scale-[1.04]">
                    {proj.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={proj.image} alt={proj.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <proj.Mock />
                    )}
                  </div>
                  <span className="absolute right-3 top-3 rounded-full bg-dusk-deep/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold backdrop-blur-sm">
                    {proj.external ? "Live ↗" : "Case study"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 px-4 py-4">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5"><FileIcon /></span>
                    <div>
                      <p className="text-[0.98rem] font-medium text-cream">{proj.title}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                        {proj.kind}
                      </p>
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 text-mist transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-gold"
                  >
                    →
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* expanded preview */}
      {p && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${p.title} — preview`}
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 sm:p-6 ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={close}
            className="absolute inset-0 cursor-default bg-dusk-deep/80 backdrop-blur-md"
          />
          <div
            className={`relative z-10 grid max-h-[88vh] w-full max-w-4xl grid-rows-[auto_1fr] overflow-hidden rounded-3xl border border-gold/30 bg-dusk shadow-[0_40px_120px_rgba(10,8,30,0.6)] transition-[transform,opacity] duration-300 ease-[var(--ease-settle)] md:grid-cols-2 md:grid-rows-1 ${
              shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.97] opacity-0"
            }`}
          >
            {/* screenshot */}
            <div className="relative aspect-[4/3] overflow-hidden border-b border-cream/10 md:aspect-auto md:border-b-0 md:border-r">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <p.Mock />
              )}
            </div>

            {/* write-up */}
            <div className="flex flex-col gap-5 overflow-y-auto p-7 md:p-9">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-gold">{p.kind}</p>
                <h3 className="display mt-3 text-[clamp(1.6rem,3vw,2.3rem)] text-cream">{p.title}</h3>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-mist">{p.tag}</p>
              </div>
              <p className="text-[0.98rem] leading-relaxed text-mist">{p.description}</p>
              <div className="mt-auto flex flex-wrap gap-3 pt-2">
                {p.external ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="btn-gold">
                    {p.cta} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link href={p.href} className="btn-gold" onClick={close}>
                    {p.cta} <span aria-hidden="true">→</span>
                  </Link>
                )}
                <Link href="/contact/" className="btn-ghost text-cream" onClick={close}>
                  Build something like this
                </Link>
              </div>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close preview"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 bg-dusk-deep/60 text-cream transition-colors duration-300 hover:border-gold hover:text-gold"
            >
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
