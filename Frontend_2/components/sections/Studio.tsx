import Reveal from "@/components/Reveal";

const team = [
  { name: "Vishnu Vardhan", role: "Frontend & design" },
  { name: "", role: "Backend & infrastructure" },
  { name: "", role: "AI & automation" },
  { name: "", role: "Research & strategy" },
  { name: "", role: "Pitching & client success" },
];

export default function Studio() {
  return (
    <section id="studio" className="relative scroll-mt-24 border-b border-iron bg-onyx py-24 md:py-32">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="label-mono">[ 04 / THE_STUDIO ]</p>
            <Reveal delay={0.05}>
              <h2 className="display h-xl mt-5 text-white">
                A small team that treats your business like the{" "}
                <em className="em">product</em>.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ash">
                We&apos;re a five-person studio. One conversation with us reaches everyone who
                designs, builds and maintains your system — no account managers, no hand-offs,
                no telephone game. We take on few projects and finish every one properly.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="md:col-span-5">
            <div className="flex h-full flex-col justify-center border border-iron p-8">
              <span className="label-mono">// SIGNAL</span>
              <p className="display h-md mt-4 text-white">
                One conversation <span className="text-kinetic">reaches everyone.</span>
              </p>
            </div>
          </Reveal>
        </div>

        {/* the five — a seam-ruled roster */}
        <Reveal delay={0.05}>
          <ul className="mt-12 grid grid-cols-1 gap-px border border-iron bg-iron sm:grid-cols-2 lg:grid-cols-5">
            {team.map((m, i) => (
              <li
                key={m.role}
                className="group flex min-h-[200px] flex-col justify-between bg-onyx p-6 transition-none hover:bg-onyx-raise"
              >
                <div className="flex items-start justify-between">
                  <span className="label-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={`flex h-9 w-9 items-center justify-center font-mono text-sm ${
                      m.name ? "bg-kinetic text-onyx" : "border border-iron text-ash"
                    }`}
                  >
                    {(m.name || "IC").slice(0, 1)}
                  </span>
                </div>
                <div>
                  <p className={`font-medium ${m.name ? "text-white" : "text-ash"}`}>
                    {m.name || "InnoCooks team"}
                  </p>
                  <p className="label-mono label-mono--ash mt-2">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
