"use client";

import dynamic from "next/dynamic";
import type { SVGProps } from "react";
import Floor from "./floor";

const GradCapBooks = dynamic(() => import("./grad-cap-books"), { ssr: false });
const GraduationCap = dynamic(() => import("./graduation-cap"), { ssr: false });
const LaptopBooks = dynamic(() => import("./laptop-books"), { ssr: false });
const Pen = dynamic(() => import("./pen"), { ssr: false });
const Pencil = dynamic(() => import("./pencil"), { ssr: false });
const SpeechBubble = dynamic(() => import("./speech-bubble"), { ssr: false });
const CharacterLaptop = dynamic(() => import("./character-laptop"), {
  ssr: false,
});

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
      <Floor />
      <GradCapBooks />
      <Pen />
      <LaptopBooks />
      <Pencil />
      <CharacterLaptop />
      <SpeechBubble />
      <GraduationCap />
    </g>
  </svg>
);
export default HeroSvgComponent;
