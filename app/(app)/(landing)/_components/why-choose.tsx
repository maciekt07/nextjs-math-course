"use client";

import { Check } from "lucide-react";

export function WhyChoose() {
  const reasons: { title: string; description: string }[] = [
    {
      title: "Interactive Learning",
      description:
        "Watch videos, take quizzes, and explore free previews — everything designed to keep you engaged while learning.",
    },
    {
      title: "Made for Math",
      description:
        "Full math rendering for clear formulas and clean explanations — no messy screenshots or unreadable text.",
    },
    {
      title: "Built by a Student",
      description:
        "Created by someone who actually understands what makes math hard — and how to make it click.",
    },
  ];

  return (
    <section className="border-y bg-muted/30 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose Math Course Online?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            It's not just another course platform. Here's what makes this one
            different.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: safe
            <div key={idx} className="space-y-3">
              <div className="flex gap-3">
                <Check className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                <h3 className="font-semibold">{reason.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
