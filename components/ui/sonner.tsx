"use client";

import { InfoIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CircleCheck } from "@/components/animate-ui/icons/circle-check";
import { CircleX } from "@/components/animate-ui/icons/circle-x";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      mobileOffset={20}
      toastOptions={{
        classNames: {
          toast: "border-border!",
          icon: "size-5!",
          success: "bg-success-background! text-success-foreground!",
          error: "bg-error-background! text-error-foreground!",
          warning: "bg-warning-background! text-warning-foreground!",
          info: "bg-info-background! text-info-foreground!",
        },
      }}
      richColors
      icons={{
        success: <CircleCheck animate className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <CircleX animate className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      {...props}
    />
  );
};

export { Toaster };
