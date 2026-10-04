import Preloader from "@/components/ui/Preloader";
import HeroSequence from "@/components/sections/HeroSequence";
import ProcessSection from "@/components/sections/ProcessSection";
import AboutSection from "@/components/sections/AboutSection";
import WorkSection from "@/components/sections/WorkSection";
import ServicesSection from "@/components/sections/ServicesSection";
import FaqSection from "@/components/sections/FaqSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="relative bg-[#000000] text-white min-h-screen">
      <Preloader />
      <HeroSequence />
      <ProcessSection />
      <AboutSection />
      <WorkSection />
      <ServicesSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
