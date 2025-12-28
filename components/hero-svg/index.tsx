"use client";

import dynamic from "next/dynamic";
import type { SVGProps } from "react";
import Floor from "@/components/hero-svg/floor";

const HeroElements = dynamic(() => import("./elements"), { ssr: false });

const HeroSvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={500}
    height={500}
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="Hero-SVG">
      {/* floor is SSR */}
      <Floor />
      <HeroElements />
    </g>
  </svg>
);
export default HeroSvgComponent;
