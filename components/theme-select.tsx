"use client";

import { Check, type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMetaColor } from "@/hooks/use-meta-color";

type ThemeItem = {
  key: "light" | "dark" | "system";
  label: string;
  icon: LucideIcon;
};

const items: ThemeItem[] = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
];

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const { setMetaColor, metaColor } = useMetaColor();

  useEffect(() => {
    setMetaColor(metaColor);
  }, [metaColor, setMetaColor]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer backdrop-blur-md focus-visible:ring-0"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map(({ key, label, icon: Icon }) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setTheme(key)}
            className="flex justify-between items-center cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Icon size={16} /> {label}
            </div>
            {theme === key && (
              <Check size={16} className="animate-in zoom-in duration-200" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
