"use client";

import React from "react";
import BookAChatButton from "@/components/ui/BookAChatButton";

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="min-h-screen py-24 md:py-32 px-6 flex flex-col justify-center items-center relative z-40 overflow-hidden bg-[#0E0E0C]"
    >
      {/* Central Services Stack */}
      <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center justify-center">
        <div className="flex flex-col gap-[48px] w-fit">
          {/* Item 1 */}
          <div className="flex items-baseline gap-6 md:gap-[32px]">
            <span
              className="invisible shrink-0 select-none pointer-events-none w-auto md:w-[315px] font-['Outfit'] font-normal text-[38px] sm:text-[54px] md:text-[72px] tracking-[-0.04em] leading-[1.05] md:leading-[74px]"
              aria-hidden="true"
            >
              We create
            </span>
            <div className="font-['Outfit'] font-normal text-[28px] sm:text-[36px] md:text-[44px] leading-[1.2] md:leading-[74px] tracking-[-0.04em] text-[#383838] blur-[2px] select-none">
              Distinctive brands.
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-baseline gap-6 md:gap-[32px]">
            <span
              className="invisible shrink-0 select-none pointer-events-none w-auto md:w-[315px] font-['Outfit'] font-normal text-[38px] sm:text-[54px] md:text-[72px] tracking-[-0.04em] leading-[1.05] md:leading-[74px]"
              aria-hidden="true"
            >
              We create
            </span>
            <div className="font-['Outfit'] font-normal text-[34px] sm:text-[44px] md:text-[54px] leading-[1.1] md:leading-[74px] tracking-[-0.04em] text-[#4A4A4A] blur-[0.5px] select-none">
              Intuitive products
            </div>
          </div>

          {/* Item 3: Active Highlight Row */}
          <div className="flex items-baseline gap-6 md:gap-[32px]">
            <span className="shrink-0 w-auto md:w-[315px] font-['Outfit'] font-normal text-[38px] sm:text-[54px] md:text-[72px] tracking-[-0.04em] leading-[1.05] md:leading-[74px]">
              <span className="text-[#EE0000]">We</span>{" "}
              <span className="text-white">create</span>
            </span>

            <div className="flex flex-col">
              <h3 className="font-['Outfit'] font-normal text-[38px] sm:text-[54px] md:text-[72px] text-white tracking-[-0.04em] leading-[1.05] md:leading-[74px]">
                Digital experiences<span className="text-[#EE0000]">.</span>
              </h3>
              <p className="font-['Outfit'] font-normal text-[16px] md:text-[20px] leading-[26px] tracking-[-0.04em] text-[#A0A09E] max-w-[670px] mt-4">
                We create responsive websites and e-commerce experiences that communicate clearly, engage users and support business growth.
              </p>
              <div className="w-full max-w-[670px] h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent mt-6 mb-1" />
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-baseline gap-6 md:gap-[32px]">
            <span
              className="invisible shrink-0 select-none pointer-events-none w-auto md:w-[315px] font-['Outfit'] font-normal text-[38px] sm:text-[54px] md:text-[72px] tracking-[-0.04em] leading-[1.05] md:leading-[74px]"
              aria-hidden="true"
            >
              We create
            </span>
            <div className="font-['Outfit'] font-normal text-[34px] sm:text-[44px] md:text-[54px] leading-[1.1] md:leading-[74px] tracking-[-0.04em] text-[#4A4A4A] blur-[0.5px] select-none">
              Scalable platforms
            </div>
          </div>

          {/* Item 5 */}
          <div className="flex items-baseline gap-6 md:gap-[32px]">
            <span
              className="invisible shrink-0 select-none pointer-events-none w-auto md:w-[315px] font-['Outfit'] font-normal text-[38px] sm:text-[54px] md:text-[72px] tracking-[-0.04em] leading-[1.05] md:leading-[74px]"
              aria-hidden="true"
            >
              We create
            </span>
            <div className="font-['Outfit'] font-normal text-[28px] sm:text-[36px] md:text-[44px] leading-[1.2] md:leading-[74px] tracking-[-0.04em] text-[#383838] blur-[2px] select-none">
              Lasting impact.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="w-full flex justify-center mt-16 md:mt-24">
        <BookAChatButton variant="inverted" />
      </div>
    </section>
  );
}
