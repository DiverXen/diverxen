"use client";

import React, { useState } from "react";
import Image from "next/image";

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

// Fanned card row (up to MAX_CARDS). The middle card is the biggest; cards on
// either side tilt away, shrink and drop. Hovering a card straightens it, scales
// it up and lifts it above the rest while the others shrink and darken.
const MAX_CARDS = 5;

const TILT_PER_STEP = 15; // deg of tilt for each step away from the middle
const CENTER_SCALE = 1.2;
const SCALE_LOSS_PER_STEP = 0.2;
const PULL_IN_PER_STEP = 2; // rem each card is pulled toward the middle, per step
const ACTIVE_SCALE = 1.35;
const ACTIVE_LIFT = -2; // rem
const INACTIVE_SCALE_LOSS = 0.15;

// Vertical drop by distance from the middle: 0, 2rem, 10rem for steps 0, 1, 2.
const dropRem = (steps: number) => 3 * steps * steps - steps;

function cardTransform(offset: number, state: "rest" | "active" | "inactive") {
  const steps = Math.abs(offset);
  const side = Math.sign(offset); // -1 left, 1 right, 0 middle
  const scale = CENTER_SCALE - SCALE_LOSS_PER_STEP * steps;
  const x = `${-side * PULL_IN_PER_STEP * steps}rem`;

  if (state === "active") {
    return `scale(${ACTIVE_SCALE}) rotate(0deg) translateX(${x}) translateY(${ACTIVE_LIFT}rem)`;
  }

  const finalScale = state === "inactive" ? scale - INACTIVE_SCALE_LOSS : scale;
  return `scale(${finalScale}) rotate(${offset * TILT_PER_STEP}deg) translateX(${x}) translateY(${dropRem(steps)}rem)`;
}

export const ProcessSection: React.FC = () => {
  const cards = INITIAL_CARDS.slice(0, MAX_CARDS);
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section
      id="approach"
      className="relative w-full flex flex-col justify-center bg-[#000000] text-white pt-28 sm:pt-32 md:pt-40 pb-28 sm:pb-36 md:pb-44 px-6 sm:px-8 overflow-hidden select-none"
    >
      {/* Subtle crimson ambient atmosphere glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 68%, rgba(238, 0, 0, 0.14) 0%, rgba(16, 16, 14, 0.4) 38%, transparent 72%)",
        }}
      />

      <div className="relative w-full max-w-[1240px] mx-auto flex flex-col items-center">
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

        {/* One column on phones; the fanned row from md up. */}
        <div
          className="mt-14 sm:mt-16 md:mt-28 grid w-[min(94vw,1360px)] grid-cols-1 gap-6 md:gap-0 md:[grid-template-columns:repeat(var(--cards),minmax(0,1fr))]"
          style={{ "--cards": cards.length } as React.CSSProperties}
          onMouseLeave={() => setActiveId(null)}
        >
          {cards.map((card, i) => {
            const offset = i - (cards.length - 1) / 2;
            const state =
              activeId === null ? "rest" : activeId === card.id ? "active" : "inactive";
            const level = Math.round(Math.abs(offset));

            return (
              <article
                key={card.id}
                onMouseEnter={() => setActiveId(card.id)}
                className="relative mx-auto aspect-[524/358] w-[min(524px,88vw)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform md:w-full md:cursor-pointer md:[transform:var(--card-transform)]"
                style={
                  {
                    "--card-transform": cardTransform(offset, state),
                    zIndex: state === "active" ? 20 : 10 - level * 4,
                  } as React.CSSProperties
                }
              >
                {/* Card face: crisp vector SVG rendered directly from the Figma asset.
                    Darkened (not covered by a box) so it follows the card's own shape. */}
                <div
                  className={`absolute inset-0 filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.85)] transition-[filter] duration-500 pointer-events-none ${
                    state === "inactive" ? "brightness-50" : ""
                  }`}
                >
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 88vw, 340px"
                    className="object-contain select-none pointer-events-none"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
