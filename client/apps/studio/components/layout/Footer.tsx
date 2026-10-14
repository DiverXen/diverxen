"use client";

import React, { useId } from "react";
import Image from "next/image";

export const Footer: React.FC = () => {
  const gradientId = useId();

  return (
    <footer className="relative w-full h-screen min-h-screen flex flex-col justify-between bg-[#10100E] rounded-b-[48px] md:rounded-b-[60px] overflow-hidden select-none">
      {/* Right Side Diagonal Accent Vector from Figma (472x873 inside 1440x873 frame) */}
      <div className="absolute top-0 right-0 h-full aspect-[472/873] pointer-events-none z-0 overflow-hidden">
        <svg
          viewBox="0 0 472 873"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-right"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M762.581 641.903L586.229 391.957L536.489 364.208L248.62 -0.81601L518.411 -0.81601L682.697 233.267L730.928 259.723L1029.37 641.903L762.581 641.903ZM1.814e-06 962.517L534.988 267.654L666.12 397.253L251.712 962.517L1.814e-06 962.517ZM729.427 362.863L598.302 233.267L1026.79 -371.707L1277 -371.707L729.427 362.863Z"
            fill={`url(#${gradientId})`}
          />
          <defs>
            <linearGradient
              id={gradientId}
              x1="638.5"
              y1="-102.666"
              x2="638.5"
              y2="827.539"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#EE0000" />
              <stop offset="1" stopColor="#10100E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Content Container - 1440px max width matching Figma frame #21 */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full flex flex-col justify-between pt-16 sm:pt-24 md:pt-32 lg:pt-[140px] px-6 sm:px-12 md:px-16 lg:px-[100px]">
        {/* Navigation & Copyright Row */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 lg:gap-12 z-20">
          {/* Navigation Links Columns (Frame 62 & Frame 63) */}
          <div className="flex gap-14 sm:gap-20 md:gap-28 lg:gap-[180px]">
            {/* Column 1: Internal Pages (Frame 62) */}
            <div className="flex flex-col gap-3.5 sm:gap-4 font-['Outfit'] font-medium text-[18px] sm:text-[20px] leading-normal tracking-normal text-white">
              <a href="#work" className="hover:text-[#EE0000] transition-colors duration-200">
                Work
              </a>
              <a href="#services" className="hover:text-[#EE0000] transition-colors duration-200">
                Services
              </a>
              <a href="#about" className="hover:text-[#EE0000] transition-colors duration-200">
                About
              </a>
              <a href="/contact" className="hover:text-[#EE0000] transition-colors duration-200">
                Contact
              </a>
              <a href="#policies" className="hover:text-[#EE0000] transition-colors duration-200">
                Policies
              </a>
            </div>

            {/* Column 2: Social Links (Frame 63) */}
            <div className="flex flex-col gap-3.5 sm:gap-4 font-['Outfit'] font-medium text-[18px] sm:text-[20px] leading-normal tracking-normal text-white">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EE0000] transition-colors duration-200"
              >
                Instagram
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EE0000] transition-colors duration-200"
              >
                LinkedIn
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EE0000] transition-colors duration-200"
              >
                Twitter
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EE0000] transition-colors duration-200"
              >
                Pinterest
              </a>
            </div>
          </div>

          {/* Copyright Notice (Figma: Outfit Regular 28px, #EE0000, 400x35) */}
          <div className="font-['Outfit'] font-normal text-[22px] sm:text-[25px] md:text-[28px] leading-normal tracking-normal text-[#EE0000] w-full lg:w-[400px] shrink-0 text-left">
            © Copyright diverxen 2026
          </div>
        </div>

        {/* Bottom Giant Brand Logo Vector - Sits Flush at the Bottom Edge */}
        <div className="w-full flex justify-center items-end mt-auto pt-16 sm:pt-24 md:pt-32 lg:pt-[140px]">
          <div className="relative w-full max-w-[1240px] aspect-[1240/343.78]">
            <Image
              alt="diverXen."
              className="object-contain object-bottom"
              fill
              priority
              src="/images/footer-logo.svg"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
