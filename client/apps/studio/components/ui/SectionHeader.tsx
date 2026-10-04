import React from "react";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
  eyebrowClassName = "",
  titleClassName = "",
  subtitleClassName = "",
}) => {
  const isCenter = align === "center";

  return (
    <div
      className={`flex flex-col ${
        isCenter ? "items-center text-center mx-auto" : "items-start text-left"
      } ${className}`}
    >
      {eyebrow && (
        <span
          className={`font-['Outfit'] font-normal text-[14px] md:text-[15px] text-[#7E7E7E] tracking-normal mb-2 select-none ${
            isCenter ? "text-center" : "text-left"
          } ${eyebrowClassName}`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-['Outfit'] font-bold text-[38px] sm:text-[48px] md:text-[56px] text-[#10100E] tracking-[-0.04em] leading-[1.1] ${
          isCenter ? "text-center" : "text-left"
        } ${titleClassName}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`font-['Outfit'] font-normal text-[14px] md:text-[15px] text-[#626262] tracking-[-0.01em] max-w-[540px] mt-3 leading-relaxed ${
            isCenter ? "text-center mx-auto" : "text-left"
          } ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
