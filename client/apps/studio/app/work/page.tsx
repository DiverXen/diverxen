import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import WorkPageFeed from "@/components/sections/WorkPageFeed";

export const metadata: Metadata = {
  title: "Work | Diverxen",
  description: "Explore our projects. We help bring ideas to life and create digital products that work.",
};

export default function WorkPage() {
  return (
    <main className="w-full min-h-screen bg-[#FFFFFF] text-[#000000] relative">
      <Navbar />
      <WorkPageFeed />
    </main>
  );
}
