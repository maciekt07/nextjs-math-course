"use client";
import {
  Check,
  type LucideIcon,
  Monitor,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Moon } from "@/components/animate-ui/icons/moon";
import { Sun } from "@/components/animate-ui/icons/sun";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { META_THEME_COLORS, useMetaColor } from "@/hooks/use-meta-color";

type ThemeItem = {
  key: "light" | "dark" | "system";
  label: string;
  icon: LucideIcon;
};

const items: ThemeItem[] = [
  { key: "light", label: "Light", icon: SunIcon },
  { key: "dark", label: "Dark", icon: MoonIcon },
  { key: "system", label: "System", icon: Monitor },
];

export function ThemeSelect() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setMetaColor } = useMetaColor();
  const prevResolvedTheme = useRef<string | undefined>(undefined);
  const [sunKey, setSunKey] = useState(0);
  const [moonKey, setMoonKey] = useState(0);

  useEffect(() => {
    const color =
      resolvedTheme === "dark"
        ? META_THEME_COLORS.dark
        : META_THEME_COLORS.light;
    setMetaColor(color);
  }, [resolvedTheme, setMetaColor]);

  useEffect(() => {
    if (prevResolvedTheme.current === undefined) {
      prevResolvedTheme.current = resolvedTheme;
      return;
    }
    if (resolvedTheme === prevResolvedTheme.current) return;
    prevResolvedTheme.current = resolvedTheme;

    if (resolvedTheme === "dark") {
      setMoonKey((k) => k + 1);
    } else {
      setSunKey((k) => k + 1);
    }
  }, [resolvedTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AnimateIcon animateOnHover>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer backdrop-blur-md focus-visible:ring-0"
          >
            <Sun
              key={`sun-${sunKey}`}
              animate={sunKey > 0}
              initialOnAnimateEnd
              className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 dark:scale-0 dark:-rotate-90"
            />
            <Moon
              key={`moon-${moonKey}`}
              animate={moonKey > 0}
              initialOnAnimateEnd
              className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 dark:scale-100 dark:rotate-0"
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </AnimateIcon>
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
              <Check
                size={16}
                className="animate-in zoom-in duration-200 motion-reduce:animate-none! motion-reduce:transition-none!"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
