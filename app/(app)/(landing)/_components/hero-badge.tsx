"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export function HeroBadge() {
  return (
    <motion.div
      className="w-fit -mt-4 sm:mt-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.2,
      }}
    >
      <Badge
        variant="secondary"
        className="flex items-center border border-border gap-2 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 w-fit cursor-pointer overflow-hidden relative group shadow-sm"
        asChild
      >
        <motion.a
          href="https://github.com/maciekt07"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 relative text-[0.875rem] sm:text-[1rem]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeatDelay: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent" />
          </motion.div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -10, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "none" }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Image
              src="/pfp.png"
              alt="avatar"
              width={96}
              height={96}
              className="rounded-full border border-border shadow-md sm:h-8 sm:w-8 h-7 w-7"
              priority
            />
          </motion.div>

          <motion.span
            className="text-muted-foreground "
            initial={{ opacity: 0, x: -10, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "none" }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Made by
          </motion.span>

          <motion.span
            className="font-semibold text-foreground relative"
            initial={{ opacity: 0, x: -10, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "none" }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            maciekt07
          </motion.span>
        </motion.a>
      </Badge>
    </motion.div>
  );
}
