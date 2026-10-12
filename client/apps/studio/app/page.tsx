import Preloader from "@/components/ui/Preloader";
import HeroSequence from "@/components/sections/HeroSequence";
import ProcessSection from "@/components/sections/ProcessSection";
import AboutSection from "@/components/sections/AboutSection";
import WorkSection from "@/components/sections/WorkSection";
import ServicesSection from "@/components/sections/ServicesSection";
import FaqSection from "@/components/sections/FaqSection";
import Footer from "@/components/layout/Footer";
import StackedSection from "@/components/transitions/StackedSection";

export default function Home() {
  return (
    <main className="relative bg-[#000000] text-white min-h-screen">
      <Preloader />
      <HeroSequence />
      {/*
        Stacked sections: each one holds still (pinned) for one viewport while
        the next scrolls up over it. HeroSequence does this itself; the
        -100vh pull-up in StackedSection matches that one-viewport hold.
      */}
      <StackedSection layer={20} pullUp covered>
        <ProcessSection />
      </StackedSection>
      <StackedSection layer={30} pullUp>
        <AboutSection />
      </StackedSection>
      <WorkSection />
      <ServicesSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
