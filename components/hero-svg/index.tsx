"use client";
import dynamic from "next/dynamic";
import { type SVGProps, useEffect, useState } from "react";
import Floor from "@/components/hero-svg/floor";

const HeroElements = dynamic(() => import("./elements"), {
  ssr: false,
  loading: () => null,
});

const preloadHeroElements = () => import("./elements");

const HeroSvgComponent = (props: SVGProps<SVGSVGElement>) => {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const preload = preloadHeroElements();

    const cb = () => {
      preload.then(() => setShow(true));
    };

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(cb, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(cb, 500);
      return () => clearTimeout(id);
    }
  }, []);

  return (
    <svg
      width={500}
      height={500}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ willChange: "transform, opacity" }}
      {...props}
    >
      <g id="Hero-SVG">
        {/* floor is SSR */}
        <Floor />
        {show && <HeroElements />}
      </g>
    </svg>
  );
};

export default HeroSvgComponent;
