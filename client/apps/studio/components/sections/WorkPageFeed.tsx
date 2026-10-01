"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageSrc: string;
}

const PROJECTS: ProjectItem[] = [
  {
    id: "sintech",
    title: "Title for the project here",
    category: "Websites",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work-project-1.png",
  },
  {
    id: "cybersabra",
    title: "Title for the project here",
    category: "Applications",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work-project-2.png",
  },
];

const FILTERS = ["All Projects", "Websites", "Applications", "Branding"];

export const WorkPageFeed: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("All Projects");

  const filteredProjects =
    activeFilter === "All Projects"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeFilter);

  return (
    <section className="w-full bg-[#FFFFFF] text-[#000000] pt-[204px] md:pt-[222px] pb-[106px] px-6 relative">
      <div className="max-w-[1240px] mx-auto">
        {/* Header Block: 804px wide, exactly 122px gap below */}
        <div className="text-center max-w-[804px] mx-auto mb-[122px]">
          <h1 className="font-['Outfit'] font-semibold text-[44px] sm:text-[68px] lg:text-[90px] leading-[0.95] tracking-[-0.04em] text-[#000000]">
            Explore our <span className="text-[#EE0000]">projects.</span>
          </h1>
          <p className="font-['Outfit'] font-normal text-[17px] md:text-[24px] tracking-[-0.02em] text-[#2C2C2C] mt-6">
            We help bring ideas to life and create digital products that work.
          </p>
        </div>

        {/* Project Feed List */}
        <div className="flex flex-col gap-[96px] md:gap-[120px]">
          {filteredProjects.map((project) => (
            <article key={project.id} className="flex flex-col gap-6 md:gap-8">
              <div className="relative w-full aspect-[1239/584] rounded-[28px] md:rounded-[42px] overflow-hidden bg-[#10100E] shadow-sm">
                <Image
                  src={project.imageSrc}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-4 max-w-[1240px]">
                <h2 className="font-['Outfit'] font-medium text-[28px] md:text-[45px] leading-[1.4] tracking-[-0.02em] text-[#000000]">
                  {project.title}
                </h2>
                <p className="font-['Outfit'] font-light text-[15px] md:text-[18px] leading-[1.4] tracking-[-0.02em] text-[#5D5D5D] max-w-[1239px]">
                  {project.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Spacing to Capsule: 106px */}
        <div className="h-[106px]" />
      </div>

      {/* Floating Filter Capsule Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-[#2A2A28]/85 backdrop-blur-md p-1.5 rounded-full flex items-center gap-1 shadow-2xl border border-white/10">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full font-['Outfit'] text-[13px] md:text-[14px] transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white text-black font-medium shadow-sm"
                    : "text-[#B0B0AF] hover:text-white"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkPageFeed;
