import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Info,
  Lightbulb,
  MessageCircleWarning,
} from "lucide-react";

type CalloutConfig = {
  label: string;
  bg: string;
  title: string;
  Icon: LucideIcon | null;
};

export const BLOCK_CONFIG = {
  note: {
    label: "Note",
    bg: "bg-info-background",
    title: "text-info-foreground",
    Icon: Info,
  },
  tip: {
    label: "Tip",
    bg: "bg-success-background",
    title: "text-success-foreground",
    Icon: Lightbulb,
  },
  important: {
    label: "Important",
    bg: "bg-warning-background",
    title: "text-warning-foreground",
    Icon: MessageCircleWarning,
  },
  warning: {
    label: "Warning",
    bg: "bg-error-background",
    title: "text-error-foreground",
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
