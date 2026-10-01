import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Ensure ScrollTrigger is registered only once across the application
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({
    ease: "power2.out",
    duration: 0.8,
  });
}

export { gsap, ScrollTrigger, useGSAP };
export default gsap;
