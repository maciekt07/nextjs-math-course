import { useEffect, useState } from "react";

/**
 * Returns a debounced version of a value that updates after a delay.
 *
 * @template T
 * @param {T} value - The value to debounce.
 * @param {number} [delay=300] - Delay in milliseconds before updating.
 * @returns {T} - The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
