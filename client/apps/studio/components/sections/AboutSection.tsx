"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { BookAChatButton } from "@/components/ui/BookAChatButton";

export const AboutSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        // Initial state: unread light gray
        gsap.set(".about-word", { color: "#E5E5E5" });
        gsap.set(".about-subcopy", { opacity: 0.2 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=2400",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // 1. Scrub each headline word sequentially
        const words = gsap.utils.toArray<HTMLElement>(".about-word");
        words.forEach((word) => {
          const isKeyword = word.dataset.keyword === "true";
          tl.to(
            word,
            {
              color: isKeyword ? "#EE0000" : "#10100E",
              duration: 0.35,
              ease: "power2.out",
            },
            ">"
          );
        });

        // 2. Reveal subcopy opacity from 0.2 to 1
        tl.to(
          ".about-subcopy",
          {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          "+=0.1"
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="min-h-screen py-16 md:py-20 flex flex-col justify-center items-center relative overflow-hidden bg-[#FDFDFD] text-[#10100E] font-['Outfit'] select-none w-full"
    >
      {/* Right side Big-X graphic from Figma */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-auto select-none z-0 overflow-hidden flex items-center justify-end">
        <Image
          src="/images/about/X-Vector.png"
          alt="Diverxen X Vector"
          width={499}
          height={1024}
          priority
          className="h-full w-auto object-contain object-right"
        />
      </div>

      <div className="relative z-10 max-w-[1240px] w-full mx-auto px-6 sm:px-12 md:px-16 flex flex-col justify-center">
        {/* Top Header Group */}
        <div>
          <span className="block text-[18px] sm:text-[22px] md:text-[24px] font-light leading-[1.0] tracking-[-0.04em] text-[#888888] mb-2">
            About us
          </span>

          <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-4 md:mb-6">
            <h2 className="font-['Outfit'] text-[38px] sm:text-[50px] md:text-[60px] font-medium leading-[1.0] tracking-[-0.04em] text-[#10100E]">
              We are
            </h2>

            {/* Logo & Studios Pill Badge */}
            <div className="inline-flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#EBEBEB] rounded-[11px] align-middle ml-2 sm:ml-3 select-none">
              <BrandLogo
                theme="light"
                className="w-[130px] sm:w-[150px] md:w-[170px] lg:w-[200px] h-auto overflow-visible"
              />
              <span className="font-['Outfit'] font-thin text-[#484848] text-[22px] sm:text-[28px] md:text-[34px] lg:text-[40px] tracking-[-0.07em] lowercase leading-none">
                studios
              </span>
            </div>
          </div>

          <p className="max-w-[572px] text-[16px] sm:text-[20px] md:text-[22px] font-normal leading-[1.1] tracking-[-0.02em] text-[#666666] mb-6 md:mb-8">
            Different by{" "}
            <span className="font-semibold text-[#EE0000]">design.</span> Driven by{" "}
            <span className="font-semibold text-[#EE0000]">purpose.</span>
          </p>
        </div>

        {/* Center Display Headline (Word-by-word reveal) */}
        <div className="max-w-[1139px] mb-6 md:mb-8">
          <h1 className="text-[clamp(2.5rem,6vw,96px)] font-bold leading-[0.88] tracking-[-0.04em]">
            <div className="block">
              <span className="about-word inline-block mr-[0.22em] text-[#E5E5E5] will-change-[color]">
                We
              </span>
              <span className="about-word inline-block mr-[0.22em] text-[#E5E5E5] will-change-[color]">
                think
              </span>
              <span className="about-word inline-block mr-[0.22em] text-[#E5E5E5] will-change-[color]">
                across
              </span>
            </div>

            <div className="block my-1 md:my-1.5">
              <span
                data-keyword="true"
                className="about-word inline-block text-[#E5E5E5] will-change-[color]"
              >
                disciplines.
              </span>
            </div>

            <div className="block">
              <span className="about-word inline-block mr-[0.22em] text-[#E5E5E5] will-change-[color]">
                We
              </span>
              <span className="about-word inline-block mr-[0.22em] text-[#E5E5E5] will-change-[color]">
                build
              </span>
              <span className="about-word inline-block mr-[0.22em] text-[#E5E5E5] will-change-[color]">
                as
              </span>
              <span
                data-keyword="true"
                className="about-word inline-block text-[#E5E5E5] will-change-[color]"
              >
                one.
              </span>
            </div>
          </h1>
        </div>

        {/* Bottom Sub-paragraph */}
        <div className="max-w-[620px] mb-8">
          <p className="about-subcopy text-[18px] sm:text-[22px] md:text-[24px] font-normal leading-[1.25] tracking-[-0.02em] text-[#10100E] will-change-[opacity]">
            Diverxen is an independent studio where{" "}
            <span className="font-medium text-[#EE0000]">
              strategy, design and technology
            </span>{" "}
            come together to create clear, cohesive digital experiences.
          </p>
        </div>

        {/* Button Wrapper */}
        <div className="w-full flex justify-center items-center mt-2 z-20">
          <BookAChatButton />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
