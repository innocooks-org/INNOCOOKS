import Reveal from "@/components/Reveal";
import SignalCard from "@/components/SignalCard";

const team = [
  { name: "Vishnu Vardhan", role: "Frontend & design" },
  { name: "Meghnath S", role: "Backend & infrastructure" },
  { name: "Priyodip Mukhopadhyay", role: "AI & automation" },
  { name: "Vivek Rajendra Patel", role: "Research & strategy" },
  { name: "Abijith G", role: "Pitching & client success" },
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
                <em className="em em-kinetic">product</em>.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ash">
                We&apos;re a five-person studio. One conversation with us reaches everyone who
                designs, builds and maintains your system. No account managers, no hand-offs,
                no telephone game. We take on few projects and finish every one properly.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="md:col-span-5">
            <SignalCard />
          </Reveal>
        </div>

        {/* the five - a seam-ruled roster */}
        <Reveal delay={0.05}>
          <ul
            className="mt-12 grid grid-cols-1 gap-px border border-iron sm:grid-cols-2 lg:grid-cols-5"
            style={{ backgroundColor: "rgba(36,31,33,0.55)" }}
          >
            {team.map((m, i) => (
              <li
                key={m.role}
                className="group flex min-h-[200px] flex-col justify-between p-6 transition-none hover:bg-onyx-raise"
                style={{ backgroundColor: "rgba(18,17,18,0.82)" }}
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
