"use client";

import type { SVGProps } from "react";
import CharacterLaptop from "./character-laptop";
import Floor from "./floor";
import GradCapBooks from "./grad-cap-books";
import GraduationCap from "./graduation-cap";
import LaptopBooks from "./laptop-books";
import Pen from "./pen";
import Pencil from "./pencil";
import SpeechBubble from "./speech-bubble";

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
