import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import WorkPageFeed from "@/components/sections/WorkPageFeed";

export const metadata: Metadata = {
  title: "UI/UX Designing | Work | Diverxen",
  description:
    "Products designed for people. Applications built to scale. We create distinctive digital experiences that turn what makes a business different into something people can see, understand and remember.",
};

export default function UIUXWorkPage() {
  return (
    <main className="w-full min-h-screen bg-[#FFFFFF] text-[#000000] relative">
      <Navbar />
      <WorkPageFeed initialCategory="ui-ux" />
    </main>
  );
}
