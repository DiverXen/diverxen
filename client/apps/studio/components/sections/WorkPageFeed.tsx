"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import {
  WORK_PROJECTS_ALL,
  WORK_PROJECTS_UI_UX,
  WORK_PROJECTS_BRANDING,
  WORK_FILTER_TABS,
  WorkProject,
} from "@/constants/workProjects";
import FilterCapsule from "@/components/ui/FilterCapsule";

export type WorkCategory = "all" | "ui-ux" | "branding";

interface WorkPageFeedProps {
  initialCategory?: WorkCategory;
}

export const WorkPageFeed: React.FC<WorkPageFeedProps> = ({
  initialCategory = "all",
}) => {
  const [category, setCategory] = useState<WorkCategory>(initialCategory);
  const [prevInitialCategory, setPrevInitialCategory] = useState<WorkCategory>(initialCategory);
  const contentRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);

  if (prevInitialCategory !== initialCategory) {
    setPrevInitialCategory(initialCategory);
    setCategory(initialCategory);
  }

  // Handle browser Back / Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      let nextCat: WorkCategory = "all";
      if (path.includes("ui-ux")) nextCat = "ui-ux";
      else if (path.includes("branding")) nextCat = "branding";

      if (nextCat !== category && !isTransitioningRef.current) {
        isTransitioningRef.current = true;
        const el = contentRef.current;
        if (!el) {
          setCategory(nextCat);
          isTransitioningRef.current = false;
          return;
        }

        gsap.to(el, {
          opacity: 0,
          y: -8,
          duration: 0.16,
          ease: "power2.in",
          onComplete: () => {
            setCategory(nextCat);
            requestAnimationFrame(() => {
              gsap.fromTo(
                el,
                { opacity: 0, y: 12 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.35,
                  ease: "power3.out",
                  clearProps: "transform,opacity",
                  onComplete: () => {
                    isTransitioningRef.current = false;
                  },
                }
              );
            });
          },
        });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [category]);

  const handleTabChange = (tabId: WorkCategory) => {
    if (tabId === category || isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // Update URL bar seamlessly without full route remount
    const href = tabId === "all" ? "/work" : tabId === "ui-ux" ? "/work/ui-ux" : "/work/branding";
    if (typeof window !== "undefined") {
      window.history.pushState({ category: tabId }, "", href);
    }

    const el = contentRef.current;
    if (!el) {
      setCategory(tabId);
      isTransitioningRef.current = false;
      return;
    }

    // Buttery GSAP content cross-fade sequence
    gsap.to(el, {
      opacity: 0,
      y: -8,
      duration: 0.16,
      ease: "power2.in",
      onComplete: () => {
        setCategory(tabId);
        requestAnimationFrame(() => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.36,
              ease: "power3.out",
              clearProps: "transform,opacity",
              onComplete: () => {
                isTransitioningRef.current = false;
              },
            }
          );
        });
      },
    });
  };

  const getProjects = (): WorkProject[] => {
    switch (category) {
      case "ui-ux":
        return WORK_PROJECTS_UI_UX;
      case "branding":
        return WORK_PROJECTS_BRANDING;
      case "all":
      default:
        return WORK_PROJECTS_ALL;
    }
  };

  const projects = getProjects();

  return (
    <section className="w-full bg-[#FFFFFF] text-[#000000] pt-[190px] sm:pt-[210px] md:pt-[224px] pb-[140px] md:pb-[170px] px-6 sm:px-8 md:px-12 relative min-h-screen">
      <div ref={contentRef} className="max-w-[1240px] mx-auto will-change-transform">
        {/* Dynamic Header Block */}
        <div className="text-center max-w-[1120px] mx-auto mb-[72px] sm:mb-[88px] md:mb-[104px]">
          {category === "all" && (
            <>
              <h1 className="font-['Outfit'] font-bold text-[38px] sm:text-[54px] md:text-[68px] lg:text-[78px] xl:text-[84px] leading-[1.02] tracking-[-0.04em] text-[#000000]">
                Explore our <span className="text-[#EE0000]">projects.</span>
              </h1>
              <p className="font-['Outfit'] font-normal text-[15px] sm:text-[17px] md:text-[19px] leading-[1.45] tracking-[-0.015em] text-[#3E3E3E] mt-4 md:mt-5 max-w-[700px] mx-auto">
                We help bring ideas to life and create digital products that work.
              </p>
            </>
          )}

          {category === "ui-ux" && (
            <>
              <h1 className="font-['Outfit'] font-bold text-[36px] sm:text-[52px] md:text-[66px] lg:text-[78px] xl:text-[84px] leading-[1.02] tracking-[-0.04em] text-[#000000]">
                <span className="block whitespace-normal sm:whitespace-nowrap">
                  <span className="text-[#EE0000]">Products</span> designed for people<span className="text-[#EE0000]">.</span>
                </span>
                <span className="block whitespace-normal sm:whitespace-nowrap">
                  <span className="text-[#EE0000]">Applications</span> built to scale<span className="text-[#EE0000]">.</span>
                </span>
              </h1>
              <p className="font-['Outfit'] font-normal text-[15px] sm:text-[17px] md:text-[19px] leading-[1.45] tracking-[-0.015em] text-[#3E3E3E] mt-4 md:mt-6 max-w-[760px] md:max-w-[820px] mx-auto">
                We create distinctive brand identities that turn what makes a business different into something people can see, understand and remember.
              </p>
            </>
          )}

          {category === "branding" && (
            <>
              <h1 className="font-['Outfit'] font-bold text-[36px] sm:text-[52px] md:text-[66px] lg:text-[78px] xl:text-[84px] leading-[1.02] tracking-[-0.04em] text-[#000000]">
                <span className="block whitespace-normal sm:whitespace-nowrap">
                  <span className="text-[#EE0000]">Branding</span> that makes
                </span>
                <span className="block whitespace-normal sm:whitespace-nowrap">
                  difference visible<span className="text-[#EE0000]">.</span>
                </span>
              </h1>
              <p className="font-['Outfit'] font-normal text-[15px] sm:text-[17px] md:text-[19px] leading-[1.45] tracking-[-0.015em] text-[#3E3E3E] mt-4 md:mt-6 max-w-[760px] md:max-w-[820px] mx-auto">
                We create distinctive brand identities that turn what makes a business different into something people can see, understand and remember.
              </p>
            </>
          )}
        </div>

        {/* Project Feed List */}
        <div className="flex flex-col gap-[76px] sm:gap-[92px] md:gap-[110px]">
          {projects.map((project, index) => (
            <article key={project.id} className="flex flex-col group">
              {/* Project Visual Display Card */}
              <div className="relative w-full aspect-[16/7.5] rounded-[24px] sm:rounded-[34px] md:rounded-[42px] overflow-hidden bg-[#10100E] shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-black/[0.03]">
                <Image
                  src={project.imageSrc}
                  alt={project.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1240px) 100vw, 1240px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.018]"
                />
              </div>

              {/* Project Info Block */}
              <div className="flex flex-col mt-6 md:mt-8 max-w-[1240px]">
                <h2 className="font-['Outfit'] font-semibold text-[24px] sm:text-[28px] md:text-[32px] lg:text-[34px] leading-[1.2] tracking-[-0.025em] text-[#000000]">
                  {project.title}
                </h2>
                <p className="font-['Outfit'] font-light text-[14px] sm:text-[15px] md:text-[16px] leading-[1.65] tracking-[-0.01em] text-[#5A5A5A] mt-3 md:mt-3.5 max-w-[1240px]">
                  {project.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Floating Filter Capsule Bar */}
      <FilterCapsule
        tabs={WORK_FILTER_TABS}
        activeTab={category}
        onTabChange={handleTabChange}
      />
    </section>
  );
};

export default WorkPageFeed;
