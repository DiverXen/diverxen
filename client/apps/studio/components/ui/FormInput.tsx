import React, { forwardRef, InputHTMLAttributes } from "react";

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-[56px] px-5 rounded-[14px] bg-[#181816] border border-transparent text-white placeholder-[#6B6B67] font-['Outfit'] text-[15px] focus:outline-none focus:border-[#EE0000]/70 focus:ring-1 focus:ring-[#EE0000]/40 transition-all ${className}`}
        {...props}
      />
    );
  }
);

FormInput.displayName = "FormInput";
export default FormInput;
