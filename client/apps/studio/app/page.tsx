import Preloader from "@/components/ui/Preloader";
import Navbar from "@/components/layout/Navbar";
import HeroSequence from "@/components/sections/HeroSequence";
import ProcessSection from "@/components/sections/ProcessSection";
import AboutSection from "@/components/sections/AboutSection";
import TeamSection from "@/components/sections/TeamSection";
import WorkSection from "@/components/sections/WorkSection";
import ServicesSection from "@/components/sections/ServicesSection";
import FaqSection from "@/components/sections/FaqSection";
import CtaSection from "@/components/sections/CtaSection";
import Footer from "@/components/layout/Footer";
import StackedSection from "@/components/transitions/StackedSection";

import ReverseStackedSection from "@/components/transitions/ReverseStackedSection";
import StickyRevealSection from "@/components/transitions/StickyRevealSection";

export default function Home() {
  return (
    <main className="relative isolate bg-[#000000] text-white min-h-screen">
      <Preloader />
      {/* Global Persistent Floating Navbar */}
      <Navbar />
      {/*
        Page layer: an opaque card holding everything above the CTA (as on
        fiasco.design). The CTA and footer wait stuck to the bottom of the
        viewport behind it, so nothing can show through gaps (e.g. pin spacers).
        Its radius is larger than the FAQ's so the black never peeks out from
        behind the FAQ's rounded corners.
      */}
      <div className="relative bg-[#000000] rounded-b-[64px] md:rounded-b-[80px]">
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
        <TeamSection />
        <WorkSection />
        <ServicesSection />
        <ReverseStackedSection layer={30}>
          <FaqSection />
        </ReverseStackedSection>
      </div>

      {/*
        Sticky reveal (same mechanism as fiasco.design), all CSS:
        1. The CTA sticks to the bottom of the viewport behind the page layer,
           tucked 80px under it. As the layer's rounded bottom edge scrolls up,
           the CTA is uncovered in place.
        2. Once the CTA's own spot arrives it scrolls up, and its rounded
           bottom (hanging over the footer) uncovers the footer, which is
           stuck behind it.
      */}
      <StickyRevealSection layer={-5} className="-mt-20 -mb-12 md:-mb-16">
        <CtaSection />
      </StickyRevealSection>
      <StickyRevealSection layer={-10}>
        <Footer />
      </StickyRevealSection>
    </main>
  );
}
