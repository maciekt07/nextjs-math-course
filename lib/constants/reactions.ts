import { Frown, type LucideIcon, Meh, Smile, Star } from "lucide-react";

export interface Reaction {
  value: number;
  icon: LucideIcon;
  label: string;
}

export const reactions = [
  { value: 1, icon: Frown, label: "Poor" },
  { value: 2, icon: Meh, label: "Fair" },
  { value: 3, icon: Smile, label: "Good" },
  { value: 4, icon: Star, label: "Excellent" },
] as const satisfies readonly Reaction[];

export const reactionValues = reactions.map((r) => r.value);
