"use client";

import Lenis from "lenis";
import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import "lenis/dist/lenis.css";

interface LenisContextValue {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ lenis: null });

export const useLenis = () => useContext(LenisContext);

interface SmoothScrollProps {
  children: React.ReactNode;
}

let activeLenis: Lenis | null = null;
const lenisListeners = new Set<() => void>();

function subscribe(listener: () => void) {
  lenisListeners.add(listener);
  return () => {
    lenisListeners.delete(listener);
  };
}

function getSnapshot() {
  return activeLenis;
}

function getServerSnapshot() {
  return null;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenis = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    // Instantiate Lenis with high-end editorial inertia
    const instance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      autoRaf: false,
    });

    activeLenis = instance;
    lenisListeners.forEach((l) => {
      l();
    });

    // Direct scroll events to ScrollTrigger
    instance.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Synchronize Lenis render loop to GSAP's internal ticker
    const updateTicker = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger when images/fonts finish loading
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(updateTicker);
      instance.destroy();
      activeLenis = null;
      lenisListeners.forEach((l) => {
        l();
      });
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis }}>{children}</LenisContext.Provider>
  );
}
