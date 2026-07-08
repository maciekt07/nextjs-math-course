"use client";

import Image from "next/image";
import { APP_NAME } from "@/lib/constants/site";

export function Logo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif",
      }}
    >
      <Image
        alt="Logo"
        src="/logo512.png"
        width={42}
        height={42}
        priority
        quality={100}
        style={{
          display: "block",
          objectFit: "contain",
        }}
      />
      <span
        style={{
          fontSize: "2.6rem",
          fontWeight: 700,
          color: "var(--theme-text)",
          letterSpacing: "-0.025em",
        }}
      >
        {APP_NAME}
      </span>
    </div>
  );
}

export function Icon() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        alt="Logo Icon"
        src="/logo512.png"
        width={28}
        height={28}
        priority
        quality={100}
        style={{
          display: "block",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
