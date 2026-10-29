"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { useLenis } from "@/components/providers/SmoothScroll";

const wordsLine1 = ["Find", "what", "makes", "you", "different,"];
const wordsLine2 = ["Build", "everything", "around", "it"];

// The handover (next section taking over the screen) plays on its own, over this
// long, as soon as the user scrolls into it, instead of following the scrollbar.
const HANDOVER_DURATION = 1.3;
const handoverEase = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function HeroSequence() {
  const { lenis } = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const copyContainerRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        const isMobile = window.innerWidth < 768;

        const logoEl = logoContainerRef.current;
        const xPath = document.querySelector("#logo-x") as SVGGraphicsElement | null;
        if (!logoEl || !xPath) return;

        // Reset transforms prior to measurement
        gsap.set(logoEl, { x: 0, y: 0, scale: 1, clearProps: "transform,transformOrigin" });

        const logoRect = logoEl.getBoundingClientRect();
        const xRect = xPath.getBoundingClientRect();

        // Calculate exact center of 'X' relative to the logo element in %
        const originXPercent = ((xRect.left + xRect.width / 2 - logoRect.left) / logoRect.width) * 100;
        const originYPercent = ((xRect.top + xRect.height / 2 - logoRect.top) / logoRect.height) * 100;

        // Calculate pixel shift needed to center 'X' on screen before scaling
        const currentXCenter = xRect.left + xRect.width / 2;
        const currentYCenter = xRect.top + xRect.height / 2;
        const shiftX = window.innerWidth / 2 - currentXCenter;
        const shiftY = window.innerHeight / 2 - currentYCenter;

        const sequenceLength = isMobile ? 2200 : 2800;

        // Extra pinned distance after the sequence: the next section slides up
        // over the hero during this stretch (see app/page.tsx).
        const handoverLength = window.innerHeight;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${sequenceLength + window.innerHeight}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Set transform-origin on the HTML logo container directly at the measured 'X' center
        gsap.set(logoContainerRef.current, {
          transformOrigin: `${originXPercent}% ${originYPercent}%`,
        });

        // Set initial visual states
        gsap.set("#logo-letters, #logo-dots", { opacity: 1, filter: "blur(0px)" });
        gsap.set("#logo-x", { fill: "#EE0000", opacity: 1 });
        gsap.set(".hero-word", { color: "#272727" });
        gsap.set(".hero-period", { color: "#381010" });

        // =============================================================
        // PHASE 1 (Scroll start): Fade letters and dots
        // =============================================================
        tl.to(
          "#logo-letters, #logo-dots",
          {
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.25,
            ease: "power1.out",
          },
          0
        );

        // =============================================================
        // PHASE 2 (HTML Container Transform):
        // Shift container by (shiftX, shiftY) and scale HTML element (not the SVG path)
        // =============================================================
        tl.to(
          logoContainerRef.current,
          {
            x: shiftX,
            y: shiftY,
            scale: isMobile ? 12 : 16,
            duration: 0.5,
            ease: "power1.inOut",
          },
          0.08
        );

        // Simultaneously transition fill of #logo-x to dark crimson
        tl.to(
          "#logo-x",
          {
            fill: "#280505",
            opacity: 0.25,
            duration: 0.45,
            ease: "power1.inOut",
          },
          0.12
        );

        // =============================================================
        // PHASE 3 (Headline Reveal):
        // Centered split headline reveals layered over the zoomed 'X'
        // =============================================================
        tl.to(
          copyContainerRef.current,
          {
            opacity: 1,
            duration: 0.2,
            ease: "power1.out",
          },
          0.55
        );

        // Sequential word illumination
        const words = gsap.utils.toArray<HTMLElement>(".hero-word");
        words.forEach((word) => {
          tl.to(
            word,
            {
              color: "#FFFFFF",
              duration: 0.22,
              ease: "power2.out",
            },
            ">"
          );
        });

        // Terminal red dot pops
        tl.to(
          ".hero-period",
          {
            color: "#EE0000",
            duration: 0.15,
            ease: "power2.out",
          },
          ">"
        );

        // Editorial description paragraph
        tl.fromTo(
          descRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
          "+=0.05"
        );

        // =============================================================
        // PHASE 4 (Handover): hero dims while ProcessSection covers it.
        // The tail is sized so the timeline's original part keeps exactly
        // the first `sequenceLength` px of scroll, and this tween the rest.
        // =============================================================
        const sequenceDuration = tl.duration();
        tl.fromTo(
          dimRef.current,
          { opacity: 0 },
          {
            opacity: 0.75,
            duration: sequenceDuration * (handoverLength / sequenceLength),
            ease: "none",
          },
          sequenceDuration
        );

        // =============================================================
        // AUTO HANDOVER: the handover stretch is the last screen of the hero's
        // pinned scroll. Once the user scrolls into it, glide the rest of the way
        // (so the next section slides in on its own and settles in the middle);
        // scrolling back up from there glides back to the hero.
        // =============================================================
        const trigger = tl.scrollTrigger;
        if (!trigger) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let gliding = false;

        const glideTo = (target: number) => {
          const instance = lenisRef.current;
          if (!instance || gliding) return;
          gliding = true;
          instance.scrollTo(target, {
            duration: HANDOVER_DURATION,
            easing: handoverEase,
            lock: true,
            force: true,
            onComplete: () => {
              gliding = false;
            },
          });
        };

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: () => trigger.start,
          end: () => trigger.end,
          onUpdate: (self) => {
            if (reduceMotion || gliding) return;

            const zoneStart = trigger.start + sequenceLength;
            const zoneEnd = trigger.end;
            const scroll = self.scroll();
            const margin = 6;

            if (scroll <= zoneStart + margin || scroll >= zoneEnd - margin) return;

            if (self.direction === 1) glideTo(zoneEnd);
            else glideTo(zoneStart);
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full bg-[#000000] text-white overflow-hidden flex items-center justify-center select-none"
    >
      {/* Atmospheric Ambient Glow: red haze rising from the bottom edge (matches Figma) */}
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />

      {/* Centered Brand Logo Outer Wrapper */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
        <div
          ref={logoContainerRef}
          className="w-[280px] sm:w-[380px] md:w-[440px] flex items-center justify-center will-change-transform"
        >
          <BrandLogo isHeroLogo className="w-full h-auto overflow-visible" />
        </div>
      </div>

      {/* Dim overlay: fades in as the next section slides over the pinned hero */}
      <div
        ref={dimRef}
        className="pointer-events-none absolute inset-0 z-30 bg-black opacity-0"
      />

      {/* Centered Copy Container positioned directly over the centered zoomed 'X' */}
      <div
        ref={copyContainerRef}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none opacity-0 will-change-transform"
      >
        <div className="max-w-[920px] mx-auto font-['Outfit',sans-serif]">
          <h1 className="font-['Outfit'] font-semibold text-[32px] sm:text-[46px] md:text-[60px] lg:text-[64px] leading-[1.08] tracking-[-0.04em] text-center text-balance select-none">
            {/* Line 1 */}
            <div className="block">
              {wordsLine1.map((word, i) => (
                <span
                  key={i}
                  className="hero-word inline-block mr-[0.24em] text-[#272727] will-change-[color]"
                  style={{ transition: "none" }}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Line 2 */}
            <div className="block mt-1 sm:mt-2">
              {wordsLine2.map((word, i) => (
                <span
                  key={i}
                  className="hero-word inline-block mr-[0.24em] text-[#272727] will-change-[color]"
                  style={{ transition: "none" }}
                >
                  {word}
                  {word === "it" && (
                    <span
                      className="hero-period text-[#381010] inline-block will-change-[color]"
                      style={{ transition: "none" }}
                    >
                      .
                    </span>
                  )}
                </span>
              ))}
            </div>
          </h1>

          <p
            ref={descRef}
            className="text-[14px] sm:text-[15px] md:text-[16px] font-light text-center max-w-[540px] mx-auto mt-5 sm:mt-6 leading-relaxed opacity-0 will-change-transform select-none text-[#D4D3D3]"
          >
            We transform ambitious ideas into distinctive brands, intuitive products and digital
            experiences built to create lasting impact.
          </p>
        </div>
      </div>
    </section>
  );
}
