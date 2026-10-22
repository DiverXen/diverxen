"use client";

import React, { useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What does Diverxen help business create?",
    answer:
      "We combine strategy, branding, UI/UX and technology to create distinctive brand identities, intuitive digital products, high-performing websites, e-commerce experiences and scalable platforms.",
  },
  {
    question: "How does Diverxen help business create?",
    answer:
      "We take an integrated approach blending brand strategy, human-centered UI/UX design, modern engineering architectures, and post-launch optimization.",
  },
  {
    question: "What kinds of clients do you work with?",
    answer:
      "From early-stage funded startups looking to differentiate themselves, to established global enterprises modernizing their digital presence.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Most strategic engagements run between 4 to 12 weeks depending on scope, architecture complexity, and sprint milestones.",
  },
  {
    question: "Can we start with a smaller engagement?",
    answer:
      "Yes, we offer targeted design sprints, brand roadmaps, and technical architecture audits before committing to full-scale buildouts.",
  },
  {
    question: "What happens after launch?",
    answer:
      "We offer continuous product optimization, scaling retainers, and design system governance to ensure long-term impact.",
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 320);
  };

  return (
    <section
      id="faq"
      className="w-full min-h-screen bg-[#FFFFFF] px-6 md:px-12 pt-20 pb-24 md:pt-28 md:pb-32 relative z-30 text-black rounded-t-none rounded-b-[48px] md:rounded-b-[64px] flex flex-col justify-center"
    >
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Headline */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <h2 className="font-['Outfit'] font-normal text-[48px] sm:text-[72px] lg:text-[clamp(56px,7vw,110px)] leading-[1.0] lg:leading-[0.98] tracking-[-0.04em] text-[#000000]">
            Questions,
            <br />
            <span className="text-[#EE0000]">clearly</span>
            <br />
            answered<span className="text-[#EE0000]">.</span>
          </h2>
          <p className="font-['Outfit'] text-[15px] md:text-[16px] text-[#626262] mt-6 max-w-[340px] leading-relaxed">
            Straight answers about how we work, what we create and what to expect
          </p>
        </div>

        {/* Right Accordion */}
        <div className="lg:col-span-7 flex flex-col">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="py-7 border-b border-[#ECECEC] flex flex-col justify-center cursor-pointer select-none transition-colors"
                onClick={() => toggleAccordion(idx)}
              >
                <div className="flex items-center justify-between gap-4 w-full text-left">
                  <h3 className="font-['Outfit'] font-medium text-[20px] md:text-[24px] text-[#000000] leading-[150%] tracking-normal">
                    {item.question}
                  </h3>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 transition-colors duration-200 ${
                      isOpen ? "bg-[#EE0000]" : "bg-[#000000]"
                    }`}
                  >
                    {isOpen ? (
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </div>
                </div>

                <div
                  className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-4"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-['Outfit'] font-normal text-[15px] md:text-[16px] text-[#565656] leading-[160%] max-w-[620px]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
