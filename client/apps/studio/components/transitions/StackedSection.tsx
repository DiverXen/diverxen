"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type HoldListener = (progress: number) => void;

const HoldProgressContext = createContext<{
  subscribe: (listener: HoldListener) => () => void;
} | null>(null);

/**
 * Progress (0 to 1) of the "hold" stretch of a covered section, while it sits
 * pinned in the middle of the screen before the next section covers it.
 */
export function useHoldProgress(onProgress: HoldListener) {
  const ctx = useContext(HoldProgressContext);
  const callbackRef = useRef(onProgress);

  useEffect(() => {
    callbackRef.current = onProgress;
  });

  useEffect(
    () => ctx?.subscribe((progress) => callbackRef.current(progress)),
    [ctx]
  );
}

interface StackedSectionProps {
  children: React.ReactNode;
  /** Stacking order: later sections need a higher layer to cover earlier ones. */
  layer: number;
  /**
   * Pull the section up by one viewport so it scrolls up over the previous
   * section, which holds still (pinned) for that stretch.
   */
  pullUp?: boolean;
  /**
   * This section gets covered by the next one: it pins once its bottom reaches
   * the bottom of the viewport, for one viewport of scroll, and dims.
   */
  covered?: boolean;
  /**
   * Extra pinned scroll before the next section starts covering this one, in
   * viewport heights. Children can follow it with useHoldProgress().
   */
  holdScreens?: number;
  /** Optional custom border class on the top edge */
  borderClassName?: string;
  /** Optional custom class on outer container */
  className?: string;
}

export default function StackedSection({
  children,
  layer,
  pullUp = false,
  covered = false,
  holdScreens = 0,
  borderClassName = "border-white/10",
  className = "",
}: StackedSectionProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const listenersRef = useRef(new Set<HoldListener>());

  const holdContext = useMemo(
    () => ({
      subscribe: (listener: HoldListener) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
    }),
    []
  );

  useGSAP(
    () => {
      if (!covered) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        // Pin, hold and dim share one ScrollTrigger so they can't drift apart.
        // Timeline durations are in viewport heights: `holdScreens` of stillness,
        // then one screen of dimming while the next section slides over.
        const total = holdScreens + 1;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pinRef.current,
            pin: pinRef.current,
            start: "bottom bottom",
            end: () => `+=${total * window.innerHeight}`,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (holdScreens <= 0) return;
              const hold = Math.min(1, (self.progress * total) / holdScreens);
              listenersRef.current.forEach((listener) => {
                listener(hold);
              });
            },
          },
        });

        if (holdScreens > 0) tl.to({}, { duration: holdScreens });
        tl.fromTo(dimRef.current, { opacity: 0 }, { opacity: 0.75, duration: 1 });
      });
    },
    { scope: pinRef, dependencies: [covered, holdScreens] }
  );

  return (
    // Outer: negative margin + stacking. Kept separate from the pinned element
    // so ScrollTrigger's pin-spacer never has to deal with the margin.
    <HoldProgressContext.Provider value={holdContext}>
    <div
      className={`relative ${pullUp ? "-mt-[100vh]" : ""} ${className}`}
      style={{ zIndex: layer }}
    >
      {/*
        will-change: transform puts the section on its own compositor layer, so
        its content (filters, SVG textures, the big shadow) is rasterised once
        and then just moved/dimmed on the GPU while the next section slides over.
      */}
      <div
        ref={pinRef}
        className="relative rounded-t-[32px] md:rounded-t-[48px] shadow-[0_-40px_120px_rgba(0,0,0,0.9)]"
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          // The shadow is only meant to lift the section off the one above it:
          // clip it at the bottom edge so nothing bleeds onto the next section.
          clipPath: "inset(-200px -200px 0 -200px)",
        }}
      >
        <div className={`overflow-hidden rounded-t-[32px] md:rounded-t-[48px] border-t ${borderClassName}`}>
          {children}
        </div>

        {covered && (
          <div
            ref={dimRef}
            className="pointer-events-none absolute inset-0 rounded-t-[32px] md:rounded-t-[48px] bg-black opacity-0"
            style={{ willChange: "opacity" }}
          />
        )}
      </div>
    </div>
    </HoldProgressContext.Provider>
  );
}
