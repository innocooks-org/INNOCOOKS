import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Process from "@/components/sections/Process";
import Studio from "@/components/sections/Studio";
import FinalCTA from "@/components/sections/FinalCTA";
import ClosingSpine from "@/components/ClosingSpine";
import CanvasSeam from "@/components/CanvasSeam";

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <CanvasSeam direction="dusk-to-parch" />
      <Services />
      <CanvasSeam direction="parch-to-dusk" compact />
      <Work />
      <CanvasSeam direction="dusk-to-parch" />

      {/* ── the closing act, stitched by one spine ── */}
      <ClosingSpine />
      <Process />
      <Studio />
      <CanvasSeam direction="parch-to-dusk" />
      <FinalCTA />
    </div>
  );
}
