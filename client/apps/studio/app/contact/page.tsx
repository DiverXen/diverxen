import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Contact | Diverxen",
  description: "Have an idea worth building or a brand ready to evolve? Let’s make it distinctive.",
};

export default function ContactPage() {
  return (
    <main className="w-full min-h-screen bg-[#10100E] text-white pt-24 md:pt-28">
      <Navbar hideOnInitial={false} />
      <ContactSection />
      <Footer />
    </main>
  );
}
