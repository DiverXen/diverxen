import React from "react";

export interface RedDotProps {
  className?: string;
  size?: number | string;
}

export const RedDot: React.FC<RedDotProps> = ({ className = "", size }) => {
  const sizeStyle = size
    ? {
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }
    : undefined;

  return (
    <span
      aria-hidden="true"
      style={sizeStyle}
      className={`rounded-full bg-[#EE0000] inline-block shrink-0 ${
        size ? "" : "w-[6px] h-[6px]"
      } ${className}`}
    />
  );
};

export default RedDot;
