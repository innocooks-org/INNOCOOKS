import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Tell InnoCooks what you're trying to build. We read every message ourselves and come back with a considered response.",
};

const next = [
  { n: "01", body: "We read what you've sent. No interns, no bots." },
  { n: "02", body: "We come back with a considered response, not a pitch deck." },
  { n: "03", body: "If it's a fit, we shape the brief together before any work starts." },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-onyx pt-24">
        <div className="container-x grid grid-cols-1 gap-16 py-20 md:grid-cols-2 md:gap-20 md:py-28">

          {/* ── Left column ── */}
          <div className="flex flex-col">
            <Reveal>
              <p className="label-mono">[ START_A_PROJECT ]</p>
              <h1 className="display h-xl mt-6 text-white">
                Tell us what you&apos;re trying to <em className="em">build</em>.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ash">
                A website, an internal system, an AI workflow, or just a problem you
                can&apos;t name yet. Describe it in your own words.
              </p>
            </Reveal>

            {/* direct contact cells */}
            <Reveal delay={0.06}>
              <div className="mt-10 grid grid-cols-2 gap-px border border-iron"
                   style={{ backgroundColor: "rgba(36,31,33,0.55)" }}>
                <div className="flex flex-col gap-2 p-5"
                     style={{ backgroundColor: "rgba(18,17,18,0.82)" }}>
                  <p className="label-mono label-mono--ash">Write to us</p>
                  <a
                    href="mailto:innocooks@gmail.com"
                    className="font-mono text-xs uppercase tracking-[0.14em] text-white transition-none hover:text-kinetic"
                  >
                    innocooks@gmail.com
                  </a>
                </div>
                <div className="flex flex-col gap-2 p-5"
                     style={{ backgroundColor: "rgba(18,17,18,0.82)" }}>
                  <p className="label-mono label-mono--ash">Where we are</p>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-white">
                    India · everywhere
                  </p>
                </div>
              </div>
            </Reveal>

            {/* what happens next */}
            <Reveal delay={0.1}>
              <div className="mt-10 border border-iron"
                   style={{ backgroundColor: "rgba(18,17,18,0.82)" }}>
                <div className="border-b border-iron px-5 py-3">
                  <p className="label-mono label-mono--ash">// What happens next</p>
                </div>
                <ul className="flex flex-col gap-px"
                    style={{ backgroundColor: "rgba(36,31,33,0.55)" }}>
                  {next.map(({ n, body }) => (
                    <li key={n}
                        className="flex items-start gap-4 px-5 py-5"
                        style={{ backgroundColor: "rgba(18,17,18,0.82)" }}>
                      <span className="label-mono mt-0.5 shrink-0">{n}</span>
                      <p className="text-sm leading-relaxed text-ash">{body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* ── Right column: form ── */}
          <Reveal delay={0.04}>
            <ContactForm />
          </Reveal>

        </div>
      </section>
      <Footer />
    </>
  );
}
