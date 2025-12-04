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
