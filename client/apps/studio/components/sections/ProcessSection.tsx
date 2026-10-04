"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, PanInfo } from "framer-motion";

export interface ProcessCardItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

const INITIAL_CARDS: ProcessCardItem[] = [
  {
    id: "discover",
    title: "Discover",
    subtitle: "Understanding the problem before deciding what to make",
    image: "/images/discover-card.svg",
  },
  {
    id: "differentiate",
    title: "Differentiate",
    subtitle: "Understanding the problem before deciding what to make",
    image: "/images/differentiate-card.svg",
  },
  {
    id: "design",
    title: "Design",
    subtitle: "Understanding the problem before deciding what to make",
    image: "/images/design-card.svg",
  },
  {
    id: "deliver",
    title: "Deliver",
    subtitle: "Understanding the problem before deciding what to make",
    image: "/images/deliver-card.svg",
  },
];

// Configuration for the 4 fanned cards in the deck
// Uniform step cascade: 94px horizontal spacing, 16px vertical cascade, matching Figma
const DESKTOP_CONFIGS = [
  { x: -140, y: -24, rotate: 0, scale: 1.0, zIndex: 40 },
  { x: -46, y: -8, rotate: 0, scale: 1.0, zIndex: 30 },
  { x: 48, y: 8, rotate: 0, scale: 1.0, zIndex: 20 },
  { x: 142, y: 24, rotate: 0, scale: 1.0, zIndex: 10 },
];

const MOBILE_CONFIGS = [
  { x: -39, y: -10, rotate: 0, scale: 1.0, zIndex: 40 },
  { x: -13, y: -3, rotate: 0, scale: 1.0, zIndex: 30 },
  { x: 13, y: 4, rotate: 0, scale: 1.0, zIndex: 20 },
  { x: 39, y: 11, rotate: 0, scale: 1.0, zIndex: 10 },
];

export const ProcessSection: React.FC = () => {
  const [cards, setCards] = useState<ProcessCardItem[]>(INITIAL_CARDS);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const bringToFront = (index: number) => {
    if (index === 0) return;
    setCards((prev) => [
      prev[index],
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const isSwipe = Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 300;
    if (isSwipe) {
      setCards((prev) => [...prev.slice(1), prev[0]]);
    }
  };

  return (
    <section
      id="approach"
      className="relative w-full bg-[#000000] text-white pt-24 sm:pt-32 md:pt-40 pb-28 sm:pb-36 md:pb-44 px-6 sm:px-8 overflow-hidden select-none"
    >
      {/* Subtle crimson ambient atmosphere glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 68%, rgba(238, 0, 0, 0.14) 0%, rgba(16, 16, 14, 0.4) 38%, transparent 72%)",
        }}
      />

      <div className="relative max-w-[1240px] mx-auto flex flex-col items-center">
        {/* Eyebrow Label: Figma exact Outfit Light 24px, -4% tracking, #888888, 24px gap */}
        <p className="font-['Outfit'] font-light text-[18px] sm:text-[22px] md:text-[24px] text-[#888888] tracking-[-0.04em] mb-4 sm:mb-6 text-center max-w-[939px]">
          What is our process
        </p>

        {/* Section Headline: Figma exact Outfit Medium (500) 60px, Line-height 74px, -4% tracking, Width 939px */}
        <h2 className="font-['Outfit'] font-medium text-[30px] sm:text-[44px] md:text-[54px] lg:text-[60px] leading-[1.2] md:leading-[74px] tracking-[-0.04em] text-center max-w-[939px] mx-auto">
          <span className="text-white">Creating digital experiences that help</span>{" "}
          <span className="block mt-1 sm:mt-0 text-white">
            ambitious brands{" "}
            <span className="text-[#EE0000]">grow, connect, and</span>
          </span>{" "}
          <span className="block mt-1 sm:mt-0 text-[#EE0000]">
            stand apart
          </span>
        </h2>

        {/* Fanned Interactive Card Deck Showcase */}
        <div className="relative w-full flex justify-center items-center mt-16 sm:mt-20 md:mt-24 h-[360px] sm:h-[420px] md:h-[460px]">
          <div className="relative w-[min(524px,88vw)] h-[min(358px,calc(88vw*(322/471)))]">
            {cards.map((card, index) => {
              const configs = isMobile ? MOBILE_CONFIGS : DESKTOP_CONFIGS;
              const config = configs[index] || configs[configs.length - 1];
              const isFront = index === 0;

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={false}
                  animate={{
                    x: config.x,
                    y: config.y,
                    rotate: config.rotate,
                    scale: config.scale,
                    zIndex: config.zIndex,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 26,
                  }}
                  drag={isFront ? "x" : false}
                  dragSnapToOrigin
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.65}
                  onDragEnd={isFront ? handleDragEnd : undefined}
                  whileDrag={{ scale: 1.03, cursor: "grabbing" }}
                  onClick={() => {
                    if (!isFront) bringToFront(index);
                  }}
                  style={{
                    zIndex: config.zIndex,
                    width: "min(524px, 88vw)",
                    height: "min(358px, calc(88vw * (322 / 471)))",
                  }}
                  className={`absolute inset-0 select-none ${
                    isFront
                      ? "cursor-grab active:cursor-grabbing"
                      : "cursor-pointer"
                  }`}
                >
                  {isFront ? (
                    /* Active Front Card: Crisp vector SVG rendered directly from Figma asset */
                    <div className="relative w-full h-full filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.85)] pointer-events-none">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        priority
                        sizes="(max-width: 524px) 88vw, 524px"
                        className="object-contain select-none pointer-events-none"
                      />
                    </div>
                  ) : (
                    /* Inactive Card Back: Authentic Black Leather Texture with Figma exact geometry & Outfit Medium 22px heading */
                    <div
                      className="absolute inset-0 select-none pointer-events-none"
                      style={{
                        filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.85))",
                      }}
                    >
                      <div
                        className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/[0.12] transition-colors"
                        style={{
                          width: "94.2066%",
                          height: "85.7304%",
                          top: "14.4502%",
                          left: "0%",
                          transformOrigin: "0% 0%",
                          transform: "rotate(-6.01934deg)",
                          backgroundImage: "url('/images/leather-texture.svg')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          boxShadow:
                            "0 20px 45px -8px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.12)",
                        }}
                      >
                        {/* Subtle depth lighting overlay across leather surface */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.52) 100%)",
                          }}
                        />

                        {/* Vertical Title on Exposed Right Strip: Figma exact Outfit Medium 22px / line-height 32px / -83.13° */}
                        <div className="absolute right-0 top-0 bottom-0 w-[94px] flex items-center justify-center pointer-events-none pr-1">
                          <span
                            className="font-['Outfit'] font-medium text-[18px] sm:text-[21px] md:text-[22px] leading-[32px] text-white tracking-normal select-none whitespace-nowrap"
                            style={{
                              transform: "rotate(90deg)",
                              transformOrigin: "center center",
                            }}
                          >
                            {card.title}
                            <span className="text-[#EE0000]">.</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
