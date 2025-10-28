"use client";

import { useState } from "react";

export function useBuyCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy(courseId: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const json = await res.json();

      if (json.url) {
        window.location.href = json.url;
      } else if (json.error) {
        setError(json.error);
        console.error(json.error);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return { buy, loading, error };
}
