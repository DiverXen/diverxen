"use client";

import React, { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface ReverseStackedSectionProps {
  children: React.ReactNode;
  /** Stacking order: higher layers sit on top of lower ones (e.g. FAQ: 30, CTA: 20, Footer: 10) */
  layer: number;
  /**
   * Pull this section up by one viewport height behind the previous section,
   * so it sits waiting in the viewport to be unveiled as the previous section scrolls up.
   */
  pullBehind?: boolean;
  /**
   * Pin this section in place while the overlying section scrolls up and off,
   * smoothly unveiling this section from underneath the previous section's rounded bottom.
   */
  pinnedReveal?: boolean;
  /**
   * Extra viewport heights of scroll to hold this section pinned after it is fully revealed.
   */
  holdScreens?: number;
  /** Rounded bottom class (default: rounded-b-[48px] md:rounded-b-[64px]) */
  roundedBottomClassName?: string;
  /** Custom shadow class for bottom edge (default: shadow-[0_35px_90px_rgba(0,0,0,0.45)]) */
  shadowClassName?: string;
  /** Optional custom class on outer container */
  className?: string;
}

export default function ReverseStackedSection({
  children,
  layer,
  pullBehind = false,
  pinnedReveal = false,
  holdScreens = 0,
  roundedBottomClassName = "rounded-b-[48px] md:rounded-b-[64px]",
  shadowClassName = "shadow-[0_35px_90px_rgba(0,0,0,0.45)]",
  className = "",
}: ReverseStackedSectionProps) {
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!pinnedReveal) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        const total = 1 + holdScreens;

        ScrollTrigger.create({
          trigger: pinRef.current,
          pin: pinRef.current,
          start: "top top",
          end: () => `+=${total * window.innerHeight}`,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      });
    },
    { scope: pinRef, dependencies: [pinnedReveal, holdScreens] }
  );

  return (
    <div
      className={`relative ${pullBehind ? "-mt-[100vh]" : ""} ${className}`}
      style={{ zIndex: layer }}
    >
      <div
        ref={pinRef}
        className={`relative ${roundedBottomClassName} ${shadowClassName}`}
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          clipPath: "inset(0 -200px -200px -200px)",
        }}
      >
        <div className={roundedBottomClassName}>
          {children}
        </div>
      </div>
    </div>
  );
}
