"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);

  useGSAP(
    () => {
      // Clean intro transition that immediately unmounts so HeroSequence receives focus at rest
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.35,
        delay: 0.1,
        ease: "power2.out",
        onComplete: () => {
          setIsDone(true);
        },
      });
    },
    { scope: containerRef }
  );

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#000000] pointer-events-none"
      aria-hidden="true"
    />
  );
}
