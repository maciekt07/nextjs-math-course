"use client";

import { track } from "@vercel/analytics";
import type React from "react";
import { useState } from "react";

const CHECKOUT_ENDPOINT = "/api/stripe/create-checkout";
const FALLBACK_ERROR = "Something went wrong. Please try again.";

type BuyResult = { success: true } | { success: false; error: string };

interface UseBuyCourseReturn {
  buy: (courseId: string) => Promise<BuyResult>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useBuyCourse(): UseBuyCourseReturn {
  const [loading, setLoading] = useState<boolean>(false);

  async function buy(courseId: string): Promise<BuyResult> {
    track("checkout_started", { courseId });
    setLoading(true);

    try {
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const json: { url?: string; error?: string } = await res.json();

      if (!res.ok) {
        return { success: false, error: json.error ?? FALLBACK_ERROR };
      }

      if (json.url) {
        window.location.href = json.url;
        return { success: true };
      }

      return { success: false, error: FALLBACK_ERROR };
    } catch (err) {
      console.error("[useBuyCourse] Checkout error:", err);
      return { success: false, error: FALLBACK_ERROR };
    } finally {
      setLoading(false);
    }
  }

  return { buy, loading, setLoading };
}
