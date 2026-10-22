import React from "react";

interface ReverseStackedSectionProps {
  children: React.ReactNode;
  /** Stacking order: higher layers sit on top of lower ones. */
  layer: number;
  /** Rounded bottom class (default: rounded-b-[48px] md:rounded-b-[64px]) */
  roundedBottomClassName?: string;
  /** CSS box-shadow for the bottom edge */
  shadow?: string;
  /** Optional custom class on outer container */
  className?: string;
}

/**
 * A section with a rounded, shadowed bottom edge that sits on top of the next
 * one. When the next section is a StickyRevealSection, this edge scrolls up
 * and uncovers it.
 */
export default function ReverseStackedSection({
  children,
  layer,
  roundedBottomClassName = "rounded-b-[48px] md:rounded-b-[64px]",
  shadow = "0 18px 56px rgba(0, 0, 0, 0.25)",
  className = "",
}: ReverseStackedSectionProps) {
  return (
    <div className={`relative ${className}`} style={{ zIndex: layer }}>
      <div
        className={`relative ${roundedBottomClassName}`}
        style={{
          boxShadow: shadow,
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
