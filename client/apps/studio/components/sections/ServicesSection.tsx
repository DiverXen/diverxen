"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import BookAChatButton from "@/components/ui/BookAChatButton";
import { useLenis } from "@/components/providers/SmoothScroll";

const SERVICES = [
  {
    title: "Distinctive brands",
    description:
      "We shape strategy, identity and visual systems that make your business unmistakable and memorable.",
  },
  {
    title: "Intuitive products",
    description:
      "We design and build human-centred digital products that feel effortless to use and easy to scale.",
  },
  {
    title: "Digital experiences",
    description:
      "We create responsive websites and e-commerce experiences that communicate clearly, engage users and support business growth.",
  },
  {
    title: "Scalable platforms",
    description:
      "We engineer reliable, modern platforms and architectures that grow with your users and your ambitions.",
  },
  {
    title: "Lasting impact",
    description:
      "We stay on after launch, optimising and evolving your product so the results keep compounding.",
  },
];

const LAST = SERVICES.length - 1;

// Scroll distance per row, as a share of the viewport height, plus a hold (in rows)
// once the last title is in focus, during which the button fades in, before the
// page moves on.
const STEP_VH = 0.55;
const END_HOLD = 0.8;
const SPAN = LAST + END_HOLD;

// How a row looks by its distance from the focused one, in rows: [distance, value]
// stops. The rows form a loop, so no row is ever further than half the list (2.5
// of 5) away; it is fully faded by then, which hides the jump where it wraps round.
const ROW_SCALE: [number, number][] = [[0, 1], [1, 0.75], [2, 0.61], [2.5, 0.55]];
const ROW_OPACITY: [number, number][] = [[0, 1], [1, 0.3], [2, 0.18], [2.5, 0]];

// When scrolling stops, glide to the nearest row (like a picker detent).
const SNAP_DELAY = 140;
const SNAP_DURATION = 0.5;
const snapEase = (t: number) => 1 - Math.pow(1 - t, 3);

const clamp01 = gsap.utils.clamp(0, 1);
const wrapDistance = gsap.utils.wrap(-SERVICES.length / 2, SERVICES.length / 2);
const curve = (stops: [number, number][], x: number) => {
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0]) {
      const [x0, y0] = stops[i - 1];
      const [x1, y1] = stops[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return stops[stops.length - 1][1];
};

export default function ServicesSection() {
  const { lenis } = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".service-row");
        const parts = rows.map((row) => ({
          row,
          sharp: row.querySelector<HTMLElement>(".service-sharp"),
          blur: row.querySelector<HTMLElement>(".service-blur"),
          period: row.querySelector<HTMLElement>(".service-period"),
          desc: row.querySelector<HTMLElement>(".service-desc"),
        }));
        const titleEl = rows[0]?.querySelector<HTMLElement>(".service-title");
        if (!titleEl) return;

        // Layout metrics (px), re-measured on every refresh since they follow the viewport.
        let lineH = 74;
        let pitch = 155; // gap between rows away from the focus
        let below = 280; // focused row to the next one, which sits under its description
        const measure = () => {
          lineH = parseFloat(getComputedStyle(titleEl).lineHeight) || lineH;
          const descH = Math.max(...parts.map((p) => p.desc?.offsetHeight ?? 0));
          pitch = lineH * 2.1;
          below = lineH / 2 + descH + lineH * 1.45;
          gsap.set(rows, { transformOrigin: `0px ${lineH / 2}px` });
        };

        // p is the (fractional) index of the row on the focus line. Rows loop round
        // like a clock face, so the slots above and below the focus are always full.
        const render = (p: number) => {
          parts.forEach(({ row, sharp, blur, period, desc }, i) => {
            const d = wrapDistance(i - p);
            const ad = Math.abs(d);
            const y = pitch * d + (below - pitch) * clamp01(d) - lineH / 2;
            const blurAmount = clamp01(ad / 2);

            gsap.set(row, {
              y,
              scale: curve(ROW_SCALE, ad),
              opacity: curve(ROW_OPACITY, ad),
            });
            // Blur is a cross-fade to a pre-blurred copy, so only opacity animates.
            gsap.set(sharp, { opacity: 1 - blurAmount });
            gsap.set(blur, { opacity: blurAmount });
            gsap.set(period, { opacity: clamp01(1 - ad * 2) });
            gsap.set(desc, { opacity: clamp01(1 - ad * 2.2) });
          });
        };

        // The button stays hidden while the titles roll and fades in once the last one
        // is in focus (p past LAST, during the end hold).
        const cta = containerRef.current?.querySelector<HTMLElement>(".service-cta") ?? null;
        const renderCta = (p: number) => {
          gsap.set(cta, { autoAlpha: clamp01((p - LAST) / END_HOLD) });
        };

        measure();

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          render(Math.floor(LAST / 2));
          gsap.set(cta, { autoAlpha: 1 });
          return;
        }
        render(0);
        renderCta(0);

        let snapTimer: number | undefined;
        const scheduleSnap = (self: ScrollTrigger) => {
          window.clearTimeout(snapTimer);
          snapTimer = window.setTimeout(() => {
            const instance = lenisRef.current;
            const p = self.progress * SPAN;
            if (!instance || self.progress <= 0 || p >= LAST) return;
            const target = self.start + (Math.round(p) / SPAN) * (self.end - self.start);
            if (Math.abs(target - self.scroll()) < 2) return;
            instance.scrollTo(target, {
              duration: SNAP_DURATION,
              easing: snapEase,
              force: true,
            });
          }, SNAP_DELAY);
        };

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${SPAN * STEP_VH * window.innerHeight}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            measure();
            render(Math.min(self.progress * SPAN, LAST));
            renderCta(self.progress * SPAN);
          },
          onUpdate: (self) => {
            render(Math.min(self.progress * SPAN, LAST));
            renderCta(self.progress * SPAN);
            scheduleSnap(self);
          },
        });

        return () => window.clearTimeout(snapTimer);
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="services"
      ref={containerRef}
      className="services-picker relative z-40 h-screen w-full overflow-hidden bg-[#0E0E0C] font-['Outfit'] font-normal tracking-[-0.04em] select-none"
    >
      <div className="relative mx-auto h-full w-[min(17em,calc(100%_-_3rem))]">
        {/* Fixed label: it never moves while the rows roll past it */}
        <div className="absolute left-0 top-[12%] md:top-[44%] md:-translate-y-1/2 whitespace-nowrap leading-[1.03]">
          <span className="text-[#EE0000]">We</span> <span className="text-white">create</span>
        </div>

        {/* Rows are placed on the focus line and moved by the scroll */}
        <div className="absolute left-0 md:left-[6em] right-0 top-[46%] md:top-[44%] h-0">
          {SERVICES.map((service) => (
            <div key={service.title} className="service-row absolute left-0 top-0 w-full will-change-transform">
              <div className="service-title relative whitespace-nowrap leading-[1.03]">
                <span className="service-sharp text-white">{service.title}</span>
                <span className="service-period text-[#EE0000]">.</span>
                <span
                  aria-hidden="true"
                  className="service-blur pointer-events-none absolute left-0 top-0 text-white blur-[2px]"
                >
                  {service.title}
                </span>
              </div>
              <div className="service-desc">
                <p className="mt-4 max-w-[670px] text-[16px] md:text-[20px] leading-[26px] text-[#A0A09E]">
                  {service.description}
                </p>
                <div className="mt-6 mb-1 h-[1px] w-full max-w-[670px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Button: hidden until the titles have all been shown */}
      <div className="service-cta invisible absolute inset-x-0 bottom-[5vh] z-10 flex justify-center">
        <BookAChatButton variant="inverted" />
      </div>
    </section>
  );
}
