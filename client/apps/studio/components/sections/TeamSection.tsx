"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";

export interface TeamMember {
  id: string;
  role: string;
  name: string;
  bio: string;
  image: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "sayan",
    role: "Developer",
    name: "Sayan Dey",
    bio: "A growing collection of brand, product and digital explorations that show how we think, design and build.",
    image: "/images/team/sayan.jpg",
  },
  {
    id: "aniket",
    role: "Designer",
    name: "Aniket Banerjee",
    bio: "A growing collection of brand, product and digital explorations that show how we think, design and build.",
    image: "/images/team/aniket.jpg",
  },
  {
    id: "amit",
    role: "Developer",
    name: "Amit Gorai",
    bio: "A growing collection of brand, product and digital explorations that show how we think, design and build.",
    image: "/images/team/member-portrait.jpg",
  },
];

export const TeamSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        gsap.fromTo(
          ".team-header-el",
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          ".team-card-el",
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: "power2.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="team"
      className="relative w-full bg-[#000000] text-white py-24 sm:py-28 md:py-36 px-6 sm:px-8 lg:px-12 overflow-hidden select-none"
    >
      <div className="relative max-w-[1240px] mx-auto flex flex-col items-center">
        {/* Header Group */}
        <div className="w-full max-w-[998px] text-left mb-14 sm:mb-16 md:mb-20">
          {/* Eyebrow */}
          <p className="team-header-el font-['Outfit'] font-light text-[18px] sm:text-[20px] md:text-[22px] text-[#888888] tracking-[-0.04em] mb-4">
            Meet the people behind the work
          </p>

          {/* Headline: Figma exact Outfit Bold (700) 73px, Line-height 111%, -4% tracking */}
          <h2 className="team-header-el font-['Outfit'] font-bold text-[34px] sm:text-[48px] md:text-[62px] lg:text-[73px] leading-[1.11] tracking-[-0.04em] text-white">
            <span className="block text-white">
              The team behind the thinking,
            </span>
            <span className="block mt-1 sm:mt-1.5">
              <span className="text-[#EE0000]">design</span>{" "}
              <span className="text-white">and</span>{" "}
              <span className="text-[#EE0000]">delivery.</span>
            </span>
          </h2>
        </div>

        {/* Team Cards Grid (3 Columns) */}
        <div className="w-full max-w-[998px] grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {TEAM_MEMBERS.map((member) => (
            <article
              key={member.id}
              className="team-card-el group relative aspect-square w-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#262626] border border-white/5 transition-transform duration-300 ease-out hover:scale-[1.02] shadow-[0_15px_35px_rgba(0,0,0,0.5)] will-change-transform"
            >
              {/* Portrait Image */}
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 320px"
                  className="object-cover object-top select-none pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              {/* Figma Exact Gradient Overlay: 0% #000000 (0% opacity) to 90% #262626 (100% opacity) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(38, 38, 38, 0.4) 55%, rgba(38, 38, 38, 0.95) 85%, #262626 90%)",
                }}
              />

              {/* Card Text Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex flex-col justify-end text-left z-10">
                {/* Name / Role: Figma Outfit SemiBold 20px, tracking -4% */}
                <h3 className="font-['Outfit'] font-semibold text-[18px] sm:text-[20px] text-white tracking-[-0.04em] leading-tight mb-2">
                  {member.role} - {member.name}
                </h3>

                {/* Description: Figma Outfit Regular 12px, #C4C4C4, tracking 0% */}
                <p className="font-['Outfit'] font-normal text-[12px] text-[#C4C4C4] leading-[1.4] tracking-normal max-w-[265px]">
                  {member.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
