import Reveal from "@/components/Reveal";

const steps = [
  {
    name: "Understand",
    copy: "We sit with you and map how your business actually works, before any talk of technology.",
  },
  {
    name: "Design",
    copy: "You see exactly what we'll build (pages, screens and flows) before a line of code is written.",
  },
  {
    name: "Build",
    copy: "Production-grade work in focused sprints, with progress you can click, not promises.",
  },
  {
    name: "Serve & maintain",
    copy: "Launch is the beginning. We stay on for updates, fixes and improvements, year-round.",
  },
];

function StepTitle({ name }: { name: string }) {
  if (name === "Serve & maintain") {
    return (
      <span className="text-kinetic">
        Serve &amp; <span data-ribbon-kw>maintain</span>
      </span>
    );
  }
  return <span className="text-kinetic">{name}</span>;
}

export default function Process() {
  return (
    <section id="process" className="relative scroll-mt-24 border-b border-iron bg-onyx py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-3xl">
          <p className="label-mono">[ 03 / HOW_WE_WORK ]</p>
          <Reveal delay={0.05}>
            <h2 className="display h-xl mt-5 text-white">
              The <em className="em">recipe</em> is simple. The{" "}
              <em className="em">discipline</em> is the <em className="em">point</em>.
            </h2>
          </Reveal>
        </div>

        <ol className="mt-16 border-t border-iron">
          {steps.map((s, i) => (
            <li key={s.name} className="group border-b border-iron">
              <div className="grid grid-cols-1 items-start gap-4 py-8 transition-none group-hover:bg-onyx-raise md:grid-cols-12 md:items-center md:gap-8 md:py-10 md:pl-6">
                <span className="label-mono col-span-1 text-ash transition-none group-hover:text-kinetic md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display h-lg col-span-1 text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 md:col-span-5">
                  <StepTitle name={s.name} />
                </h3>
                <p className="col-span-1 max-w-md text-base leading-relaxed text-ash md:col-span-6">
                  {s.copy}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <Reveal delay={0.05}>
          <p className="mt-12 max-w-xl border-l-2 border-kinetic pl-6 text-base leading-relaxed text-ash">
            Every build includes a year of care. We don&apos;t hand over a project and
            disappear. We maintain the systems we serve.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
