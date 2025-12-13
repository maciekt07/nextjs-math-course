import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontStyle = "default" | "system" | "dyslexic";

export type BooleanSettingKey = {
  [K in keyof SettingsStore]: SettingsStore[K] extends boolean ? K : never;
}[keyof SettingsStore];

interface SettingsStore {
  desmosForceDarkMode: boolean;
  coloredMarkdown: boolean;
  fontStyle: FontStyle;
  largeMath: boolean;
  toggle: (key: BooleanSettingKey) => void;
  setFontStyle: (fontStyle: FontStyle) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      desmosForceDarkMode: true,
      coloredMarkdown: true,
      largeMath: true,
      fontStyle: "default",
      toggle: (key) => set((state) => ({ [key]: !state[key] as boolean })),
      setFontStyle: (fontStyle) => set(() => ({ fontStyle: fontStyle })),
    }),
    {
      name: "course-settings",
    },
  ),
);
