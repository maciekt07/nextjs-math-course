import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#0a0a0a",
};

export function useMetaColor(): {
  metaColor: string;
  setMetaColor: (color: string) => void;
} {
  const { resolvedTheme } = useTheme();

  const metaColor = useMemo(() => {
    return resolvedTheme !== "dark"
      ? META_THEME_COLORS.light
      : META_THEME_COLORS.dark;
  }, [resolvedTheme]);

  const setMetaColor = useCallback((color: string) => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", color);
  }, []);

  return {
    metaColor,
    setMetaColor,
  };
}
