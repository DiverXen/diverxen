"use client";

import React, { forwardRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { RedDot } from "@/components/ui/RedDot";
import { useLenis } from "@/components/providers/SmoothScroll";
import { NAV_ITEMS, type NavItem } from "@/constants/navigation";

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  items?: NavItem[];
  className?: string;
  hideOnInitial?: boolean;
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ items = NAV_ITEMS, className = "", hideOnInitial, ...props }, ref) => {
    const pathname = usePathname();
    const { lenis } = useLenis();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("");

    const shouldHide = hideOnInitial ?? false;

    useEffect(() => {
      if (pathname === "/contact" || pathname.startsWith("/contact/")) {
        setActiveSection("/contact");
      } else if (pathname === "/work" || pathname.startsWith("/work/")) {
        setActiveSection("/work");
      } else {
        const updateHash = () => {
          setActiveSection(window.location.hash || "");
        };
        updateHash();
        window.addEventListener("hashchange", updateHash);
        return () => window.removeEventListener("hashchange", updateHash);
      }
    }, [pathname]);

    // Freeze page scroll while mobile menu is open
    useEffect(() => {
      if (!mobileOpen || !lenis) return;
      lenis.stop();
      return () => lenis.start();
    }, [mobileOpen, lenis]);

    const isItemActive = (item: NavItem) => {
      if (pathname === "/contact" || pathname.startsWith("/contact/")) {
        return item.href === "/contact" || item.label.toLowerCase() === "contact";
      }
      if (pathname === "/work" || pathname.startsWith("/work/")) {
        return item.href === "/work" || item.label.toLowerCase() === "work";
      }
      if (item.href === "/contact" || item.href === "/work") {
        return false;
      }
      return (
        activeSection === item.href ||
        activeSection === item.href.replace("/", "")
      );
    };

    return (
      <>
        {/* Floating Desktop & Tablet Compact Pill Navbar */}
        <header
          ref={ref}
          className={`fixed top-6 md:top-[42px] left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto ${
            shouldHide ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
          } transition-opacity duration-300 will-change-transform ${className}`}
          {...props}
        >
          <nav
            aria-label="Primary Navigation"
            className="
              w-[727px] max-w-[92vw] h-[72px]
              px-6 sm:px-[68px] py-[22px]
              rounded-[50px]
              border-0 border-none outline-none
              bg-[#10100E]/60 backdrop-blur-2xl
              shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.18),0_16px_40px_rgba(0,0,0,0.45)]
              flex items-center justify-between gap-4
              transition-all duration-300
            "
          >
            {/* Brand Logo: Figma exact 101px × 28px */}
            <Link
              href="/"
              className="relative z-10 flex items-center shrink-0 select-none outline-none"
              aria-label="Diverxen Home"
            >
              <BrandLogo className="w-[101px] h-[28px]" />
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="relative z-10 hidden md:flex items-center gap-6 select-none list-none m-0 p-0">
              {items.map((item) => {
                const active = isItemActive(item);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setActiveSection(item.href)}
                      className={`font-['Outfit'] text-[15px] tracking-[-0.02em] transition-colors duration-200 inline-flex items-baseline ${
                        active
                          ? "text-white font-medium"
                          : "text-zinc-300 hover:text-white font-normal"
                      }`}
                    >
                      <span>{item.label}</span>
                      {active && (
                        <RedDot size={5} className="ml-[2px] mb-[1px]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="relative z-10 md:hidden p-1.5 text-white hover:text-[#EE0000] transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`h-[1.5px] bg-current rounded-full transition-transform duration-300 origin-left ${
                    mobileOpen ? "rotate-45 translate-x-0.5" : ""
                  }`}
                />
                <span
                  className={`h-[1.5px] bg-current rounded-full transition-opacity duration-300 ${
                    mobileOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`h-[1.5px] bg-current rounded-full transition-transform duration-300 origin-left ${
                    mobileOpen ? "-rotate-45 translate-x-0.5" : ""
                  }`}
                />
              </div>
            </button>
          </nav>
        </header>

        {/* Mobile Fullscreen Navigation Overlay */}
        <div
          className={`fixed inset-0 z-[10000] md:hidden bg-[#10100E]/95 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between p-8 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Header with Brand Logo and Close Button */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center shrink-0 select-none outline-none"
              aria-label="Diverxen Home"
            >
              <BrandLogo className="w-[115px] h-[32px]" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Vertical Nav Links */}
          <div className="flex flex-col gap-7 my-auto">
            {items.map((item, idx) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-3xl sm:text-4xl font-['Outfit'] transition-colors inline-flex items-baseline ${
                    active ? "text-white font-medium" : "text-white/80 hover:text-white font-normal"
                  }`}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                >
                  <span>{item.label}</span>
                  {active && (
                    <RedDot className="w-[8px] h-[8px] sm:w-[9px] sm:h-[9px] ml-[4px]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer Copyright */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-xs text-[#888888] font-['Outfit'] text-center">
              © 2026 Diverxen Studio. All rights reserved.
            </p>
          </div>
        </div>
      </>
    );
  }
);

Navbar.displayName = "Navbar";
export default Navbar;

