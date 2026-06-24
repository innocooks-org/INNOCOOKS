"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/#build", label: "What we build", idx: "01" },
  { href: "/#work", label: "Work", idx: "02" },
  { href: "/#process", label: "Process", idx: "03" },
  { href: "/#studio", label: "Studio", idx: "04" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  // lock background scroll while the overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="nav-safe flex items-center justify-between border-b border-iron bg-onyx/80 backdrop-blur-md">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="display text-lg leading-none tracking-tight text-white md:text-xl"
        >
          INNO<span className="text-kinetic">COOKS</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="label-mono label-mono--ash px-3 py-1.5 text-white/80 transition-none hover:bg-kinetic hover:text-onyx"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact/"
            className="ml-3 inline-flex items-center gap-2 border border-white/30 px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-white transition-none hover:border-kinetic hover:bg-kinetic hover:text-onyx"
          >
            Start a project <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* mobile trigger */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="-mr-2 flex flex-col gap-1.5 p-2 md:hidden"
        >
          <span
            className={`block h-px w-7 bg-white transition-transform duration-200 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-7 bg-white transition-transform duration-200 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* full-screen overlay menu - `inert` when closed so its links are fully
          removed from the tab order and the accessibility tree */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-onyx transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-center border-b border-iron px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/android-chrome-512x512-background-removed.png"
            alt="InnoCooks"
            className="h-9 w-auto brightness-0 invert"
          />
        </div>
        <ul className="flex flex-1 flex-col justify-center gap-2 px-5">
          {links.map((l) => (
            <li key={l.href} className="border-b border-iron py-3">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="display h-lg flex items-baseline gap-4 text-white"
              >
                <span className="label-mono">{l.idx}</span>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <Link
            href="/contact/"
            onClick={() => setOpen(false)}
            className="btn-primary w-full justify-center"
          >
            Start a project <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
