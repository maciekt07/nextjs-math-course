type PluralCategory = Intl.LDMLPluralRule;

type PluralForms = Partial<Record<PluralCategory, string>> & {
  other: string;
  zero?: string;
};

type FormatPluralOptions = {
  /**
   * default `"en-US"`
   */
  locale?: Intl.LocalesArgument;
  numberFormatOptions?: Intl.NumberFormatOptions;
  pluralRuleOptions?: Intl.PluralRulesOptions;
};

/**
 * Formats a number with `Intl.NumberFormat` and appends the correct plural label
 * selected by `Intl.PluralRules`
 *
 * @param value - Finite numeric value to format
 * @param forms - Plural labels keyed by Intl plural category
 * @param options - Optional Intl locale, number formatting, and plural rule options
 * @returns A formatted string such as `"1 task"`, `"2 tasks"`, or `"0 no tasks"`
 *
 * @throws {TypeError} When `value` is `NaN`, `Infinity`, or `-Infinity`
 *
 * @example
 * formatPlural(1, { one: "question", other: "questions" });
 * // "1 question"
 * formatPlural(0, { zero: "tasks", one: "task", other: "tasks" });
 * // "0 tasks"
 */
export function formatPlural(
  value: number,
  forms: PluralForms,
  options: FormatPluralOptions = {},
): string {
  if (!Number.isFinite(value)) {
    throw new TypeError("formatPlural expected a finite number.");
  }

  const { locale = "en-US", numberFormatOptions, pluralRuleOptions } = options;

  const formattedNumber = new Intl.NumberFormat(
    locale,
    numberFormatOptions,
  ).format(value);

  if (value === 0 && forms.zero) {
    return forms.zero;
  }

  const category = new Intl.PluralRules(locale, pluralRuleOptions).select(
    value,
  );
  const label = forms[category] ?? forms.other;

  return `${formattedNumber} ${label}`;
}

/**
 * Formats a duration in seconds to a MM:SS string format.
 *
 * @param seconds - The duration in seconds to format
 * @returns A formatted string in the format "M:SS" or "MM:SS" (e.g., "13:23", "0:05")
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Convert seconds to rounded minutes and return as a "X min read" string.
 * @param seconds Number of seconds
 * @returns Formatted reading time string
 */
export function formatReadingTime(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} min read`;
}

/**
 * Converts a number of seconds into a human-readable duration
 * (seconds, minutes, hours, or days).
 *
 * @param seconds - The duration in seconds.
 * @returns A formatted string like "45 seconds", "3 minutes", "2 hours", or "5 days".
 */
export function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""}`;
}
