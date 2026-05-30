type AnalyticsEvents = {
  checkout_started: {
    courseId: string;
  };
};

/**
 * Sends an analytics event to Google Analytics via `gtag`.
 *
 * @param event - Analytics event name
 * @param params - Parameters required for the selected event
 */
export function trackEvent<T extends keyof AnalyticsEvents>(
  event: T,
  params: AnalyticsEvents[T],
): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params);
  }
}
