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
