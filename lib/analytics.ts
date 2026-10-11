export interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, any>;
}

export function trackGA4Event(event: AnalyticsEvent) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event.eventName, event.parameters);
  }
}

export function trackMetaPixelEvent(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, parameters);
  }
}

// Analytics events constants
export const ANALYTICS_EVENTS = {
  CLICK_JOIN_NOW: "click_join_now",
  BOOKING_FORM_SUBMIT: "booking_form_submit",
  COMPANY_APPLICATION_SUBMIT: "company_application_submit",
  SERVICE_BOOKING_COMPLETE: "service_booking_complete",
};
