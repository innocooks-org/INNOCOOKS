import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Work from "@/components/sections/Work";
import Process from "@/components/sections/Process";
import Studio from "@/components/sections/Studio";
import FinalCTA from "@/components/sections/FinalCTA";
import RibbonField from "@/components/RibbonField";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <RibbonField intensity={1.15}>
      <Hero />
      <Manifesto />
      <Work />
      <Process />
      <Studio />
      <FinalCTA />
      <Footer />
    </RibbonField>
  );
}
