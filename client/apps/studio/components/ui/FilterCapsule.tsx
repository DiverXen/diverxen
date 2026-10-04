"use client";

import React, { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export interface FilterTabItem<T extends string = string> {
  id: T;
  label: string;
  href?: string;
}

export interface FilterCapsuleProps<T extends string = string> {
  tabs: FilterTabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function FilterCapsule<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  ariaLabel = "Category filter",
}: FilterCapsuleProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const isInitialMount = useRef(true);

  const updatePill = (animate = true) => {
    const target = tabsRef.current[activeTab];
    const container = containerRef.current;
    const pill = pillRef.current;
    if (!target || !container || !pill) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const x = targetRect.left - containerRect.left;
    const width = targetRect.width;

    if (animate && !isInitialMount.current) {
      gsap.killTweensOf(pill);
      gsap.to(pill, {
        x,
        width,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    } else {
      gsap.set(pill, {
        x,
        width,
        opacity: 1,
      });
    }
  };

  useGSAP(
    () => {
      updatePill(false);

      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(() => {
          updatePill(false);
          isInitialMount.current = false;
        });
      } else {
        isInitialMount.current = false;
      }

      const handleResize = () => {
        updatePill(false);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      updatePill(!isInitialMount.current);
    },
    { dependencies: [activeTab], scope: containerRef }
  );

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onTabChange(tabs[nextIndex].id);
      tabsRef.current[tabs[nextIndex].id]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onTabChange(tabs[prevIndex].id);
      tabsRef.current[tabs[prevIndex].id]?.focus();
    }
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={`fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 select-none ${className}`}
    >
      {/* Capsule Frame: W 496, H 72, Gap 8, Padding 8, Backdrop Blur */}
      <div
        ref={containerRef}
        role="tablist"
        className="relative w-auto max-w-[calc(100vw-32px)] sm:w-[496px] h-[72px] p-2 bg-[#6E6E6C]/95 backdrop-blur-md rounded-full flex items-center justify-between gap-2 shadow-[0_16px_36px_-4px_rgba(0,0,0,0.24),0_4px_12px_-2px_rgba(0,0,0,0.12)] border border-black/5"
      >
        {/* Smooth White Active Pill Indicator — H 56, rounded-full, #FFFFFF */}
        <div
          ref={pillRef}
          aria-hidden="true"
          className="absolute top-2 left-0 h-[56px] bg-[#FFFFFF] rounded-full z-10 opacity-0 pointer-events-none shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
        />

        {/* Tab Buttons & Dividers */}
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;

          return (
            <React.Fragment key={tab.id}>
              {idx > 0 && (
                <div
                  aria-hidden="true"
                  className="w-[1px] h-[20px] bg-white/20 shrink-0 pointer-events-none relative z-10"
                />
              )}
              <a
                ref={(el) => {
                  tabsRef.current[tab.id] = el;
                }}
                href={tab.href || "#"}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) return;
                  e.preventDefault();
                  onTabChange(tab.id);
                }}
                className="relative z-20 h-[56px] px-5 sm:px-6 md:px-7 rounded-full flex items-center justify-center select-none text-center outline-none shrink-0 cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <span
                  className={`font-['Outfit'] text-[16px] tracking-[-0.02em] whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "text-[#10100E] font-medium"
                      : "text-white font-medium hover:text-white/90"
                  }`}
                >
                  {tab.label}
                </span>
              </a>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}

export default FilterCapsule;
