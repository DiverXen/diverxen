"use client";

import React from "react";
import Link from "next/link";
import { ChatIcon } from "@/components/icons/ChatIcon";

export interface BookAChatButtonProps {
  className?: string;
  href?: string;
  variant?: "default" | "inverted";
  label?: string;
}

export const BookAChatButton: React.FC<BookAChatButtonProps> = ({
  className = "",
  href = "/contact",
  variant = "default",
  label = "Book a chat",
}) => {
  const isDefault = variant === "default";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center select-none cursor-pointer transition-all duration-200 ${
        isDefault
          ? "gap-[6px] h-[53px] px-[22px] py-[10px] rounded-full bg-[#000000] text-white hover:bg-[#FFFFFF] hover:text-[#000000] shadow-md"
          : "gap-2.5 px-6 py-3.5 rounded-full bg-[#EE0000] text-white hover:bg-white hover:text-black shadow-lg shadow-[#EE0000]/20"
      } ${className}`}
    >
      <ChatIcon
        className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${
          isDefault
            ? "text-white group-hover:text-[#000000]"
            : "text-white group-hover:text-black"
        }`}
      />
      <span
        className={`font-['Outfit'] tracking-[-0.01em] whitespace-nowrap transition-colors duration-200 ${
          isDefault
            ? "font-normal text-[15px] text-white group-hover:text-[#000000]"
            : "font-medium text-[15px] text-white group-hover:text-black"
        }`}
      >
        {label}
      </span>
    </Link>
  );
};

export default BookAChatButton;
