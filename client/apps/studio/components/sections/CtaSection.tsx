"use client";

import React from "react";
import BookAChatButton from "@/components/ui/BookAChatButton";

export const CtaSection: React.FC = () => {
  return (
    <section
      id="cta"
      className="w-full h-screen min-h-screen bg-[#EE0000] py-20 px-6 flex flex-col items-center justify-center text-center relative select-none rounded-t-none rounded-b-[48px] md:rounded-b-[64px] shadow-[0_35px_90px_rgba(0,0,0,0.5)]"
    >
      <div className="max-w-[1240px] mx-auto flex flex-col items-center justify-center my-auto">
        <h2 className="font-['Outfit'] font-normal text-[42px] sm:text-[58px] md:text-[72px] lg:text-[84px] leading-[1.06] tracking-[-0.03em] text-white max-w-[940px] mx-auto select-none">
          Let’s build what makes<br className="hidden sm:inline" /> you different.
        </h2>

        {/* Centered Button fully INSIDE the red container */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center items-center">
          <BookAChatButton />
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
