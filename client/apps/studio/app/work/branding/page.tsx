import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import WorkPageFeed from "@/components/sections/WorkPageFeed";

export const metadata: Metadata = {
  title: "Branding | Work | Diverxen",
  description:
    "Branding that makes difference visible. We create distinctive brand identities that turn what makes a business different into something people can see, understand and remember.",
};

export default function BrandingWorkPage() {
  return (
    <main className="w-full min-h-screen bg-[#FFFFFF] text-[#000000] relative">
      <Navbar />
      <WorkPageFeed initialCategory="branding" />
    </main>
  );
}
