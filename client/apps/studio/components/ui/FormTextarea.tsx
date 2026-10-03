import React, { forwardRef, TextareaHTMLAttributes } from "react";

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className = "", rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full p-5 rounded-[14px] bg-[#181816] border border-transparent text-white placeholder-[#6B6B67] font-['Outfit'] text-[15px] resize-none focus:outline-none focus:border-[#EE0000]/70 focus:ring-1 focus:ring-[#EE0000]/40 transition-all ${className}`}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = "FormTextarea";
export default FormTextarea;
