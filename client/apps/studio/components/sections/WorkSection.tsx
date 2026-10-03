"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";

interface ProjectCard {
  id: string;
  image: string;
  className: string;
  bgStyle?: React.CSSProperties;
  accentOverlay?: React.ReactNode;
}

const INITIAL_PROJECTS: ProjectCard[] = [
  {
    id: "layer-0-sintech",
    image: "/images/work/card-front-sintech.png",
    className: "bg-[#0A0A0A] border-t border-white/20",
  },
  {
    id: "layer-1-green",
    image: "/images/work/card-green-pattern.png",
    className: "border-t border-[#1a5438]/60",
    bgStyle: {
      background: "linear-gradient(135deg, #0e3020 0%, #081a11 100%)",
    },
    accentOverlay: (
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 10px)",
        }}
      />
    ),
  },
  {
    id: "layer-2-crimson",
    image: "/images/work/card-crimson-frame.png",
    className: "bg-[#160404] border-t border-[#EE0000]/60",
    bgStyle: {
      boxShadow: "inset 0 2px 8px rgba(238, 0, 0, 0.7)",
    },
    accentOverlay: (
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#EE0000] to-transparent shadow-[0_0_14px_#EE0000] pointer-events-none" />
    ),
  },
  {
    id: "layer-3-obsidian",
    image: "/images/work/card-dark-slab.png",
    className: "bg-[#111110] border-t border-white/10",
    accentOverlay: (
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
    ),
  },
];

const STACK_CONFIGS = [
  { scale: 1.0, y: 0, zIndex: 40, opacity: 1 },
  { scale: 0.919, y: -58, zIndex: 30, opacity: 1 },
  { scale: 0.799, y: -116, zIndex: 20, opacity: 1 },
  { scale: 0.676, y: -174, zIndex: 10, opacity: 1 },
];

export const WorkSection: React.FC = () => {
  const [cards, setCards] = useState<ProjectCard[]>(INITIAL_PROJECTS);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    const isHorizontalSwipe =
      Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 400;
    const isVerticalSwipe =
      Math.abs(info.offset.y) > 80 || Math.abs(info.velocity.y) > 400;

    if (isHorizontalSwipe || isVerticalSwipe) {
      setCards((prev) => [...prev.slice(1), prev[0]]);
    }
  };

  const bringToFront = (index: number) => {
    if (index === 0) return;
    setCards((prev) => [
      prev[index],
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  return (
    <section
      id="work"
      className="relative w-full min-h-screen pt-20 pb-24 md:pt-28 md:pb-32 bg-[#FDFDFD] text-[#10100E] overflow-hidden font-['Outfit'] select-none flex flex-col justify-center"
    >
      <div className="max-w-[1240px] w-full mx-auto px-6 sm:px-12 md:px-16 flex flex-col items-center">
        {/* Header Section Typography & Spacing */}
        <SectionHeader
          eyebrow="Our work"
          title={
            <>
              Ideas, shaped into <span className="text-[#EE0000]">Impact.</span>
            </>
          }
          subtitle="A growing collection of brand, product and digital explorations that show how we think, design and build."
          className="mb-8 md:mb-10"
        />

        {/* Interactive Stacked Card Deck */}
        <div className="relative w-full max-w-[930px] mx-auto pt-28 md:pt-36 flex justify-center items-center">
          <div className="relative w-[92vw] max-w-[930px] h-[358px]">
            {cards.map((card, index) => {
              const config = STACK_CONFIGS[index] || {
                scale: 0.55,
                y: -232,
                zIndex: 5,
                opacity: 0.5,
              };
              const isFront = index === 0;

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={false}
                  animate={{
                    scale: config.scale,
                    y: config.y,
                    zIndex: config.zIndex,
                    opacity: config.opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 26,
                  }}
                  drag={isFront}
                  dragSnapToOrigin
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.65}
                  onDragEnd={isFront ? handleDragEnd : undefined}
                  whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                  onClick={() => {
                    if (!isFront) bringToFront(index);
                  }}
                  style={{
                    zIndex: config.zIndex,
                    ...card.bgStyle,
                  }}
                  className={`absolute inset-0 w-[92vw] max-w-[930px] h-[358px] rounded-[40px] overflow-hidden shadow-[1px_-10px_88px_0px_rgba(151,151,151,0.18)] select-none ${
                    card.className
                  } ${
                    isFront
                      ? "cursor-grab active:cursor-grabbing"
                      : "cursor-pointer"
                  }`}
                >
                  {/* Card Visual Asset from Figma */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <Image
                      src={card.image}
                      alt="Work project showcase"
                      fill
                      sizes="(max-width: 930px) 92vw, 930px"
                      priority={isFront}
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Card Horizon / Accent Overlay */}
                  {card.accentOverlay}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* "View our work" CTA Pill Button */}
        <div className="w-full flex justify-center mt-12 md:mt-16 z-50">
          <Link
            href="/work"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#000000] text-white font-['Outfit'] font-medium text-[15px] tracking-[-0.01em] hover:bg-[#EE0000] transition-colors duration-200 shadow-md cursor-pointer"
          >
            View our work
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WorkSection;
