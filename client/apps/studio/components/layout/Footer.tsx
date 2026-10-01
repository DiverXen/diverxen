"use client";

import React from "react";
import Image from "next/image";

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full bg-[#0E0E0C] rounded-b-[48px] md:rounded-b-[60px] overflow-hidden pt-24 md:pt-32 pb-6 md:pb-10 px-6 md:px-14 select-none">
      {/* Right Side Diagonal Accent Vector */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] max-w-[650px] h-full pointer-events-none z-0 overflow-hidden">
        <Image
          alt=""
          className="object-right object-contain opacity-90"
          fill
          priority
          src="/images/footer-vector.svg"
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1360px] mx-auto flex flex-col justify-between min-h-[520px] md:min-h-[620px]">
        {/* Navigation & Copyright Row */}
        <div className="w-full max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-baseline gap-12 z-20 pt-4">
          {/* Navigation Links Columns */}
          <div className="flex gap-16 md:gap-28">
            {/* Column 1: Internal Pages */}
            <div className="flex flex-col gap-3.5 font-['Outfit'] font-medium text-[17px] md:text-[20px] leading-normal tracking-normal text-white">
              <a href="#work" className="hover:text-[#EE0000] transition-colors duration-200">
                Work
              </a>
              <a href="#services" className="hover:text-[#EE0000] transition-colors duration-200">
                Services
              </a>
              <a href="#approach" className="hover:text-[#EE0000] transition-colors duration-200">
                Approach
              </a>
              <a href="#contact" className="hover:text-[#EE0000] transition-colors duration-200">
                Contact
              </a>
              <a href="#policies" className="hover:text-[#EE0000] transition-colors duration-200">
                Policies
              </a>
            </div>

            {/* Column 2: Social Links */}
            <div className="flex flex-col gap-3.5 font-['Outfit'] font-medium text-[17px] md:text-[20px] leading-normal tracking-normal text-white">
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
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EE0000] transition-colors duration-200"
              >
                Youtube
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

          {/* Copyright Notice */}
          <div className="font-['Outfit'] font-normal text-[20px] sm:text-[24px] md:text-[28px] leading-normal tracking-normal text-[#EE0000] w-auto md:w-[400px] shrink-0 text-left md:text-right">
            © Copyright diverxen 2026
          </div>
        </div>

        {/* Bottom Giant Brand Logo Vector */}
        <div className="w-full flex justify-center items-end mt-auto pt-16 md:pt-24">
          <div className="relative w-full max-w-[1360px] h-[130px] sm:h-[180px] md:h-[240px] lg:h-[300px]">
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
