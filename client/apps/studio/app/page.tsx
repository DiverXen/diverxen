import Preloader from "@/components/ui/Preloader";
import HeroSequence from "@/components/sections/HeroSequence";
import ProcessSection from "@/components/sections/ProcessSection";
import AboutSection from "@/components/sections/AboutSection";
import WorkSection from "@/components/sections/WorkSection";
import ServicesSection from "@/components/sections/ServicesSection";
import FaqSection from "@/components/sections/FaqSection";
import CtaSection from "@/components/sections/CtaSection";
import Footer from "@/components/layout/Footer";
import StackedSection from "@/components/transitions/StackedSection";

import ReverseStackedSection from "@/components/transitions/ReverseStackedSection";

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
      {/*
        Bottom reverse-stack card reveal (matching Figma Frame 58 and fiasco.design):
        1. FaqSection sits on top (layer 30) with flat top and rounded-b-[48px] md:rounded-b-[64px].
        2. CtaSection sits underneath (layer 20) with pullBehind (-mt-[100vh]), pinnedReveal, and holdScreens={1}.
           As FaqSection scrolls up, its rounded bottom edge rolls upward, revealing the Red CTA section!
        3. Footer sits underneath (layer 10) with pullBehind (-mt-[100vh]), pinnedReveal, and holdScreens={0}.
           As CtaSection scrolls up, its rounded bottom edge rolls upward, revealing the Footer!
      */}
      <ReverseStackedSection layer={30}>
        <FaqSection />
      </ReverseStackedSection>

      <ReverseStackedSection
        layer={20}
        pullBehind
        pinnedReveal
        holdScreens={1}
        shadowClassName="shadow-[0_35px_90px_rgba(0,0,0,0.5)]"
      >
        <CtaSection />
      </ReverseStackedSection>

      <ReverseStackedSection
        layer={10}
        pullBehind
        pinnedReveal
        holdScreens={0}
        shadowClassName=""
      >
        <Footer />
      </ReverseStackedSection>
    </main>
  );
}
