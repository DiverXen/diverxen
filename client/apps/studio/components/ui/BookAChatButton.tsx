"use client";

import React from "react";
import Link from "next/link";
import { ChatIcon } from "@/components/icons/ChatIcon";

export interface BookAChatButtonProps {
  className?: string;
  href?: string;
  variant?: "default" | "inverted";
}

export const BookAChatButton: React.FC<BookAChatButtonProps> = ({
  className = "",
  href = "/contact",
}) => {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-[6px] h-[53px] px-[22px] py-[10px] rounded-full bg-[#000000] text-white hover:bg-[#FFFFFF] hover:text-[#000000] transition-all duration-200 select-none shadow-md ${className}`}
    >
      <ChatIcon className="w-[18px] h-[18px] text-white group-hover:text-[#000000] transition-colors duration-200 shrink-0" />
      <span className="font-['Outfit'] font-normal text-[15px] tracking-[-0.01em] whitespace-nowrap text-white group-hover:text-[#000000] transition-colors duration-200">
        Book a chat
      </span>
    </Link>
  );
};

export default BookAChatButton;
