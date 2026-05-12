"use client";
import { motion, type Variants } from "motion/react";
import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/components/animate-ui/icons/icon";

type BookOpenProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    pages: {
      initial: { scaleX: 1 },
      animate: {
        scaleX: [1, 0.0, 0.0, 1],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
          times: [0, 0.38, 0.48, 1],
        },
      },
    },
    spine: {
      initial: { y: 0 },
      animate: {
        y: [0, -4, -4, 0],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
          times: [0, 0.38, 0.48, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    pages: {
      initial: { scaleX: 1 },
      animate: {
        scaleX: [1, 0.05, 0.05, 1],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
          times: [0, 0.38, 0.48, 1],
          repeat: Infinity,
          repeatDelay: 0.8,
        },
      },
    },
    spine: {
      initial: { y: 0 },
      animate: {
        y: [0, -4, -4, 0],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
          times: [0, 0.38, 0.48, 1],
          repeat: Infinity,
          repeatDelay: 0.8,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BookOpenProps) {
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
        d="M12 7v14"
        variants={variants.spine}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
        style={{ transformOrigin: "12px 12px" }}
        variants={variants.pages}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BookOpen(props: BookOpenProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BookOpen,
  BookOpen as BookOpenIcon,
  type BookOpenProps,
  type BookOpenProps as BookOpenIconProps,
};
