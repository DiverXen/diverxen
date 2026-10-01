import React from "react";

interface BrandXVectorProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  variant?: "light" | "dark" | "ambient";
}

export const BrandXVector: React.FC<BrandXVectorProps> = ({
  className = "w-auto h-full",
  variant = "light",
  ...props
}) => {
  const gradientId = React.useId();

  // Gradient stops according to Figma
  const endColor = variant === "light" ? "#FDFDFD" : "#10100E";

  if (variant === "ambient") {
    return (
      <svg
        viewBox="0 0 2912 3556"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M1738.95 2701.49L1336.8 2035.33L1223.38 1961.38L566.938 988.506H1182.15L1556.78 1612.39L1666.77 1682.9L2347.32 2701.49H1738.95ZM0 3556L1219.96 1704.04L1518.98 2049.45L573.991 3556H0ZM1663.34 1957.79L1364.33 1612.39L2341.43 0H2912L1663.34 1957.79Z"
          fill="#EE0000"
          fillOpacity="0.1"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1277 1565"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M762.581 1188.93L586.229 895.752L536.489 863.204L248.62 435.043L518.411 435.043L682.697 709.615L730.928 740.647L1029.37 1188.93L762.581 1188.93ZM1.814e-06 1565L534.988 749.95L666.12 901.965L251.712 1565L1.814e-06 1565ZM729.427 861.626L598.302 709.615L1026.79 -1.19016e-06L1277 -1.48018e-06L729.427 861.626Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="638.5"
          y1="315.576"
          x2="638.5"
          y2="1406.68"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EE0000" />
          <stop offset="1" stopColor={endColor} />
        </linearGradient>
      </defs>
    </svg>
  );
};
