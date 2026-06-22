import Link from "next/link";

const cols = [
  {
    head: "Index",
    items: [
      { label: "What we build", href: "/#build" },
      { label: "Work", href: "/#work" },
      { label: "Process", href: "/#process" },
      { label: "Studio", href: "/#studio" },
    ],
  },
  {
    head: "Direct",
    items: [
      { label: "Start a project", href: "/contact/" },
      { label: "innocooks@gmail.com", href: "mailto:innocooks@gmail.com" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-iron">
      {/* upper: callsign + nav columns */}
      <div className="container-x relative z-10 grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/android-chrome-512x512-background-removed.png"
            alt="InnoCooks"
            className="mb-5 h-14 w-auto brightness-0 invert"
          />
          <p className="display h-md text-white">
            INNO<span className="text-kinetic">COOKS</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash">
            Websites, internal systems and AI automation for growing businesses.
            Crafted like products, not projects.
          </p>
          <p className="label-mono label-mono--ash mt-8">COOKING INNOVATION // INDIA</p>
        </div>

        {cols.map((c) => (
          <nav key={c.head} className="md:col-span-3">
            <p className="label-mono label-mono--ash mb-5">{c.head}</p>
            <ul className="flex flex-col gap-3">
              {c.items.map((it) => (
                <li key={it.label}>
                  {it.href.startsWith("mailto:") ? (
                    <a
                      href={it.href}
                      className="font-mono text-xs uppercase tracking-[0.14em] text-white/80 transition-none hover:text-kinetic"
                    >
                      {it.label}
                    </a>
                  ) : (
                    <Link
                      href={it.href}
                      className="font-mono text-xs uppercase tracking-[0.14em] text-white/80 transition-none hover:text-kinetic"
                    >
                      {it.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* the giant watermark */}
      <div className="pointer-events-none relative flex justify-center overflow-hidden">
        <span className="display select-none whitespace-nowrap text-[24vw] leading-[0.78] text-white/[0.04]">
          INNOC
          <span data-ribbon-end-orange="1">O</span>
          <span data-ribbon-end-blue="1">O</span>
          KS
        </span>
      </div>

      {/* baseline */}
      <div className="container-x relative z-10 flex flex-col gap-2 border-t border-iron pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ash md:flex-row md:items-center md:justify-between">
        <span>© {year} InnoCooks · Cooking Innovation</span>
        <span>Designed &amp; built by InnoCooks. No templates.</span>
      </div>
    </footer>
  );
}
