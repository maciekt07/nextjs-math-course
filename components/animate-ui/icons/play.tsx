"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/components/animate-ui/icons/icon";

type PlayProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    polygon: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: 3,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    polygon: {
      initial: {
        x: 0,
        transition: { duration: 0.6, ease: "easeInOut" },
      },
      animate: {
        x: [0, 3, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PlayProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path
        d="M7 4.5 C7 4.5 19 11 19 12 C19 13 7 19.5 7 19.5 C6.2 20 5 19.5 5 18.5 L5 5.5 C5 4.5 6.2 4 7 4.5 Z"
        variants={variants.polygon}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Play(props: PlayProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Play,
  Play as PlayIcon,
  type PlayProps,
  type PlayProps as PlayIconProps,
};
