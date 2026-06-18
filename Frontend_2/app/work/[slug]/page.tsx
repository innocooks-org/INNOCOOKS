import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { projects, getProject } from "@/lib/projects";
import Footer from "@/components/Footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: `${p.title} · Case study`, description: p.summary };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const host = p.liveUrl ? new URL(p.liveUrl).host : "";
  const eyebrow = `CASE_STUDY // ${p.badge.toUpperCase().replace(/ /g, "_")}`;

  return (
    <>
    <article className="bg-onyx pt-20 md:pt-24">
      {/* back / close bar */}
      <div className="container-x flex items-center justify-between border-b border-iron py-4">
        <Link
          href="/#work"
          className="label-mono group flex items-center gap-2 text-ash transition-none hover:text-kinetic"
        >
          <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">
            ←
          </span>
          Back to work
        </Link>
        <Link
          href="/#work"
          aria-label="Close case study"
          className="flex h-9 w-9 items-center justify-center border border-iron text-ash transition-none hover:border-kinetic hover:text-kinetic"
        >
          <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      <header className="container-x py-14 md:py-20">
        <Reveal>
          <p className="label-mono">[ {eyebrow} ]</p>
          <h1 className="display h-hero mt-6 max-w-4xl text-white">{p.title}</h1>
          <p className="label-mono label-mono--ash mt-6">{p.meta}</p>
        </Reveal>
      </header>

      {/* screenshot, then the CTAs immediately after it */}
      <div className="container-x">
        <Reveal>
          <figure className="border border-iron">
            <div className="flex items-center gap-3 border-b border-iron px-4 py-3">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full border border-ash-dim" />
                <span className="h-2.5 w-2.5 rounded-full border border-ash-dim" />
                <span className="h-2.5 w-2.5 rounded-full border border-ash-dim" />
              </span>
              <span className="label-mono label-mono--ash">{host || p.title}</span>
            </div>
            <div className="relative aspect-video overflow-hidden bg-onyx-raise">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={`${p.title} website`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="display h-lg text-white/85">{p.title}</span>
                  <span className="label-mono label-mono--ash">Screenshot</span>
                </div>
              )}
            </div>
          </figure>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/contact/" className="btn-primary">
              Build something like this <span aria-hidden="true">→</span>
            </Link>
            {p.liveUrl && (
              <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                Visit the live site ↗
              </a>
            )}
          </div>
        </Reveal>
      </div>

      {/* the write-up */}
      <div className="container-x flex max-w-4xl flex-col gap-16 py-16 md:py-24">
        {p.phases.map((phase, i) => (
          <Reveal key={phase.label}>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
              <p className="label-mono md:col-span-3">
                {String(i + 1).padStart(2, "0")} / {phase.label}
              </p>
              <p
                className="display md:col-span-9 text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.2] tracking-tight text-white"
                style={{ textTransform: "none" }}
              >
                {phase.body}
              </p>
            </section>
          </Reveal>
        ))}

        {p.next && p.next.length > 0 && (
          <Reveal>
            <section className="border border-iron p-8 md:p-10">
              <p className="label-mono">// THE SHAPE OF WHAT&apos;S NEXT</p>
              <ul className="mt-6 grid grid-cols-1 gap-px border border-iron bg-iron sm:grid-cols-2">
                {p.next.map((item) => (
                  <li key={item} className="flex items-center gap-3 bg-onyx px-5 py-5">
                    <span className="h-px w-6 bg-kinetic" aria-hidden="true" />
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-white">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        {/* footer nav back to all work */}
        <Reveal>
          <Link
            href="/#work"
            className="label-mono group inline-flex items-center gap-2 text-ash transition-none hover:text-kinetic"
          >
            <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Back to all work
          </Link>
        </Reveal>
      </div>
    </article>
    <Footer />
    </>
  );
}
