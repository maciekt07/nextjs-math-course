type AnalyticsEvents = {
  checkout_started: {
    courseId: string;
  };
};

export function trackEvent<T extends keyof AnalyticsEvents>(
  event: T,
  params: AnalyticsEvents[T],
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params);
  }
}
