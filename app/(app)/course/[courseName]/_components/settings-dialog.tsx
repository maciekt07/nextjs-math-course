"use client";

import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  type BooleanSettingKey,
  type FontStyle,
  useSettingsStore,
} from "@/stores/settingsStore";

const switchSettings: ReadonlyArray<{
  key: BooleanSettingKey;
  label: string;
  description: string;
}> = [
  {
    key: "desmosForceDarkMode",
    label: "Force Graph Dark Mode",
    description:
      "Force all Desmos graphs to dark mode when theme is set to dark.",
  },
  {
    key: "coloredMarkdown",
    label: "Colored Markdown",
    description: "Apply custom colors to LaTeX symbols in markdown.",
  },
  {
    key: "largeMath",
    label: "Large Math",
    description: "Increase the font size of LaTeX math expressions.",
  },
] as const;

export function SettingsDialogContent() {
  const {
    desmosForceDarkMode,
    coloredMarkdown,
    largeMath,
    fontStyle,
    toggle,
    setFontStyle,
  } = useSettingsStore();

  const settings = { desmosForceDarkMode, coloredMarkdown, largeMath };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-2xl">Settings</DialogTitle>
        <DialogDescription>
          Customize your preferences and app behavior
        </DialogDescription>
      </DialogHeader>

      <Separator />

      <div className="space-y-6 py-2">
        {switchSettings.map(({ key, label, description }) => (
          <div key={key}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={key}
                  className="text-base font-semibold cursor-pointer"
                >
                  {label}
                </Label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={() => toggle(key)}
                className="mt-1"
              />
            </div>
          </div>
        ))}

        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="fontStyle"
                className="text-base font-semibold cursor-pointer"
              >
                Font Style
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose a font style for lesson content.
              </p>
            </div>

            <Select
              value={fontStyle}
              onValueChange={(v: FontStyle) => setFontStyle(v)}
            >
              <SelectTrigger id="fontStyle" className="w-[180px]">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="system">System Font</SelectItem>
                <SelectItem value="dyslexic">Dyslexic Friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
