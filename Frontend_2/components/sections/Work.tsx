import Link from "next/link";
import Reveal from "@/components/Reveal";
import { projects } from "@/lib/projects";

/* Selected work as a grid of editorial project cards (distinct from the text
 * list used by "How we work"). Each card has a screenshot-ready visual panel
 * and opens its own case-study page; the live-site link lives inside that page. */

function ProjectKeywordTitle({ title }: { title: string }) {
  return <>{title}</>;
}

export default function Work() {
  return (
    <section id="work" className="relative scroll-mt-24 border-b border-iron bg-onyx py-24 md:py-32">
      <div className="container-x">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="label-mono">[ 02 / SELECTED_WORK ]</p>
            <h2 className="display h-xl mt-5 text-white">
              Built by us. Used for <em className="em">real</em>.
            </h2>
          </div>
          <span className="label-mono label-mono--ash mb-2 hidden md:block">
            {String(projects.length).padStart(2, "0")} projects
          </span>
        </div>

        <Reveal delay={0.05}>
          <div
            className="mt-12 grid gap-px border border-iron sm:grid-cols-2 lg:grid-cols-3"
            style={{ backgroundColor: "rgba(36,31,33,0.55)" }}
          >
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={`/work/${p.slug}/`}
                className="group flex flex-col transition-none hover:bg-onyx-raise"
                style={{ backgroundColor: "rgba(18,17,18,0.82)" }}
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b border-iron">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                    />
                  ) : (
                    /* title-card placeholder until a real screenshot is dropped in */
                    <div className="absolute inset-0 flex items-center justify-center bg-onyx-raise">
                      <span className="display pointer-events-none absolute select-none text-[8rem] leading-none text-white/[0.05]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="display h-md relative px-6 text-center text-white/85 transition-none group-hover:text-kinetic">
                        <ProjectKeywordTitle title={p.title} />
                      </span>
                    </div>
                  )}
                  <span className="label-mono absolute right-3 top-3 bg-onyx/70 px-2 py-1 text-kinetic backdrop-blur-sm">
                    {p.badge}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-4 p-5">
                  <div>
                    <span className="label-mono label-mono--ash">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="display h-md mt-2 text-white transition-none group-hover:text-kinetic">
                      {p.title}
                    </h3>
                    <p className="label-mono label-mono--ash mt-1.5">{p.kind}</p>
                  </div>
                  <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ash transition-none group-hover:text-kinetic">
                    {p.year} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
