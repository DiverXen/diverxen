"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
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

// Scroll stack: the whole section pins in the middle of the screen. The first
// card is already in place; every further card slides up from below and lands
// on the same spot, in front. Cards beneath it shrink, dim and shift up a little
// so their top edges stay visible, like a deck. The "View our work" button
// appears once the last card has landed.
const CARD_HEIGHT = 358;
const SCALE_STEP = 0.05; // scale lost for every card stacked on top
const PEEK_STEP = 28; // px each buried card moves up per card on top
const DIM_STEP = 0.14; // black overlay opacity added per card on top
const SCROLL_PER_CARD = 0.9; // viewport heights of scroll for each card to land
const CTA_REVEAL = 0.4; // timeline units for the button to fade in
const END_HOLD = 0.3; // timeline units the finished stack stays pinned

export const WorkSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".work-card");
        const dims = gsap.utils.toArray<HTMLElement>(".work-card-dim");
        if (cards.length < 2) return;

        const cta = sectionRef.current?.querySelector<HTMLElement>(".work-cta");
        const landings = cards.length - 1;
        const total = landings + CTA_REVEAL + END_HOLD;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${total * SCROLL_PER_CARD * window.innerHeight}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        for (let i = 1; i < cards.length; i++) {
          const at = i - 1; // each landing takes one unit of timeline

          // Card i waits just below the screen, then slides up onto the stack.
          tl.fromTo(
            cards[i],
            { y: () => window.innerHeight },
            { y: 0, ease: "power2.out", duration: 1 },
            at
          );

          // Everything beneath it settles one level deeper.
          for (let k = 0; k < i; k++) {
            const depth = i - k;
            tl.fromTo(
              cards[k],
              {
                scale: 1 - SCALE_STEP * (depth - 1),
                y: -PEEK_STEP * (depth - 1),
              },
              {
                scale: 1 - SCALE_STEP * depth,
                y: -PEEK_STEP * depth,
                duration: 1,
                immediateRender: false,
              },
              at
            );
            tl.fromTo(
              dims[k],
              { opacity: DIM_STEP * (depth - 1) },
              { opacity: DIM_STEP * depth, duration: 1, immediateRender: false },
              at
            );
          }
        }

        // Button appears once the last card is in place, then the stack holds.
        if (cta) {
          tl.fromTo(
            cta,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              ease: "power2.out",
              duration: CTA_REVEAL,
              // Not clickable while it is still invisible.
              onStart: () => cta.classList.remove("pointer-events-none"),
              onReverseComplete: () => cta.classList.add("pointer-events-none"),
            },
            landings
          );
        }
        tl.to({}, { duration: END_HOLD }, landings + CTA_REVEAL);
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative w-full h-screen flex flex-col justify-center py-10 bg-[#FDFDFD] text-[#10100E] overflow-hidden font-['Outfit'] select-none"
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
          className="mb-6 md:mb-8"
        />

        {/* Card stack: every card sits on the same spot, later ones above earlier ones */}
        <div
          className="relative w-[92vw] max-w-[930px]"
          style={{
            height: CARD_HEIGHT,
            // Room above the front card for the buried cards peeking out.
            marginTop: PEEK_STEP * (INITIAL_PROJECTS.length - 1),
          }}
        >
          {INITIAL_PROJECTS.map((card, i) => (
            <div
              key={card.id}
              className={`work-card absolute inset-0 rounded-[40px] overflow-hidden shadow-[1px_-10px_88px_0px_rgba(151,151,151,0.18)] will-change-transform ${card.className}`}
              style={{
                transformOrigin: "50% 0%",
                zIndex: i + 1,
                ...card.bgStyle,
              }}
            >
              {/* Card Visual Asset from Figma */}
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <Image
                  src={card.image}
                  alt="Work project showcase"
                  fill
                  sizes="(max-width: 930px) 92vw, 930px"
                  priority={i === 0}
                  className="object-cover object-center"
                />
              </div>

              {/* Card Horizon / Accent Overlay */}
              {card.accentOverlay}

              {/* Dims the card as others stack on top of it */}
              <div className="work-card-dim pointer-events-none absolute inset-0 bg-black opacity-0" />
            </div>
          ))}
        </div>

        {/* "View our work" CTA Pill Button */}
        <div className="work-cta w-full flex justify-center mt-8 md:mt-10 relative z-50 opacity-0 pointer-events-none">
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
