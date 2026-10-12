"use client";

import { useRef } from "react";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        const isMobile = window.innerWidth < 768;

        const logoEl = logoContainerRef.current;
        const xPath =
          containerRef.current?.querySelector<SVGGraphicsElement>("#logo-x");
        if (!logoEl || !xPath) return;

        // Reset transforms prior to measurement
        gsap.set(logoEl, {
          x: 0,
          y: 0,
          scale: 1,
          clearProps: "transform,transformOrigin",
        });

        const logoRect = logoEl.getBoundingClientRect();
        const xRect = xPath.getBoundingClientRect();

        // Centre of the X relative to the logo element, in %
        const originXPercent =
          ((xRect.left + xRect.width / 2 - logoRect.left) / logoRect.width) *
          100;
        const originYPercent =
          ((xRect.top + xRect.height / 2 - logoRect.top) / logoRect.height) *
          100;

        // Pixel shift that puts the X in the middle of the screen before scaling
        const shiftX = window.innerWidth / 2 - (xRect.left + xRect.width / 2);
        const shiftY = window.innerHeight / 2 - (xRect.top + xRect.height / 2);

        const sequenceLength = isMobile ? 2200 : 2800;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `+=${sequenceLength}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Scale the HTML container around the X, not the SVG path itself
        gsap.set(logoEl, {
          transformOrigin: `${originXPercent}% ${originYPercent}%`,
        });

        gsap.set("#logo-letters, #logo-dots", {
          opacity: 1,
          filter: "blur(0px)",
        });
        gsap.set("#logo-x", { fill: "#EE0000", opacity: 1 });

        // Letters and dots fade out
        tl.to(
          "#logo-letters, #logo-dots",
          {
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.25,
            ease: "power1.out",
          },
          0,
        );

        // The X travels to the middle of the screen and zooms in
        tl.to(
          logoEl,
          {
            x: shiftX,
            y: shiftY,
            scale: isMobile ? 12 : 16,
            duration: 0.5,
            ease: "power1.inOut",
          },
          0.08,
        );

        // ...while dimming to a dark crimson
        tl.to(
          "#logo-x",
          {
            fill: "#280505",
            opacity: 0.25,
            duration: 0.45,
            ease: "power1.inOut",
          },
          0.12,
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative flex h-screen w-full select-none items-center justify-center overflow-hidden bg-background text-foreground"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[58vh] w-[90vw] max-w-[1400px] -translate-x-1/2 rounded-[100%] bg-hero-glow opacity-70 blur-[160px]" />

      {/* Centred brand logo */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <div
          ref={logoContainerRef}
          className="flex w-[280px] items-center justify-center will-change-transform sm:w-[380px] md:w-[440px]"
        >
          <BrandLogo isHeroLogo className="h-auto w-full overflow-visible" />
        </div>
      </div>
    </section>
  );
}
