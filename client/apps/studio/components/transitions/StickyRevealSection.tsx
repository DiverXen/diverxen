import React from "react";

interface StickyRevealSectionProps {
  children: React.ReactNode;
  /**
   * Stacking order inside the page's stacking context. Negative, so the section
   * waits behind the opaque page layer until that layer has scrolled away.
   */
  layer: number;
  /** Margins that tuck the section under its neighbours (e.g. "-mt-20 -mb-12"). */
  className?: string;
}

/**
 * Sticks to the bottom of the viewport behind the content above it, so that
 * content scrolls up and uncovers this section in place. Once the section's own
 * spot in the flow arrives it scrolls away normally, uncovering the next one.
 * Pure CSS (no scroll listeners), as on fiasco.design.
 */
export default function StickyRevealSection({
  children,
  layer,
  className = "",
}: StickyRevealSectionProps) {
  return (
    <div className={`sticky bottom-0 ${className}`} style={{ zIndex: layer }}>
      {children}
    </div>
  );
}
