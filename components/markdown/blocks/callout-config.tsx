import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Info,
  Lightbulb,
  MessageCircleWarning,
} from "lucide-react";

export type CalloutConfig = {
  label: string;
  bg: string;
  title: string;
  Icon: LucideIcon | null;
};

export const BLOCK_CONFIG = {
  note: {
    label: "Note",
    bg: "bg-blue-500/5",
    title: "text-blue-700 dark:text-blue-500",
    Icon: Info,
  },
  tip: {
    label: "Tip",
    bg: "bg-emerald-500/5",
    title: "text-emerald-700 dark:text-emerald-500",
    Icon: Lightbulb,
  },
  important: {
    label: "Important",
    bg: "bg-orange-500/5",
    title: "text-amber-700 dark:text-amber-500",
    Icon: MessageCircleWarning,
  },
  warning: {
    label: "Warning",
    bg: "bg-red-500/5",
    title: "text-red-700 dark:text-red-400",
    Icon: AlertTriangle,
  },
  card: {
    label: "You will learn",
    bg: "bg-card p-6!",
    title: "text-slate-900 dark:text-slate-50 text-2xl! font-bold! mb-4!",
    Icon: null,
  },
} as const satisfies Record<string, CalloutConfig>;

export type BlockType = keyof typeof BLOCK_CONFIG;
export const VALID_BLOCK_TYPES = Object.keys(BLOCK_CONFIG) as BlockType[];
