// src/utils/analytics.ts
/**
 * Google Analytics 4 (GA4) tracking utilities
 * Handles page views, events, and user interactions
 */

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set' | 'js',
      targetId: string | Date | Record<string, any>,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics
 * Should be called once when the app loads
 * Matches the standard Google Analytics 4 implementation
 */
export const initGA = (): void => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID not configured');
    return;
  }

  // Initialize dataLayer (standard GA4 pattern)
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());

  // Load the gtag.js script dynamically (async)
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Configure GA4 after script loads
  script.onload = () => {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      send_page_view: false, // We'll track page views manually for SPA routing
    });
  };
};

/**
 * Track a page view
 * Call this when the route changes in your React Router
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track a custom event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
): void => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', eventName, {
    event_category: eventParams?.category,
    event_label: eventParams?.label,
    value: eventParams?.value,
    ...eventParams,
  });
};

/**
 * Track user actions
 */
export const trackUserAction = {
  // Authentication
  login: (method?: string) => {
    trackEvent('login', { method: method || 'email' });
  },
  logout: () => {
    trackEvent('logout');
  },
  signup: (method?: string) => {
    trackEvent('sign_up', { method: method || 'email' });
  },

  // Appointments
  appointmentBooked: (doctorId?: string) => {
    trackEvent('appointment_booked', { doctor_id: doctorId });
  },
  appointmentCancelled: (appointmentId?: string) => {
    trackEvent('appointment_cancelled', { appointment_id: appointmentId });
  },

  // Prescriptions
  prescriptionOrdered: (prescriptionId?: string) => {
    trackEvent('prescription_ordered', { prescription_id: prescriptionId });
  },

  // Search
  searchPerformed: (query: string, resultsCount?: number) => {
    trackEvent('search', {
      search_term: query,
      results_count: resultsCount,
    });
  },

  // Clicks
  buttonClick: (buttonName: string, location?: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      location: location || window.location.pathname,
    });
  },

  // Video calls
  videoCallStarted: (callType?: string) => {
    trackEvent('video_call_started', { call_type: callType });
  },
  videoCallEnded: (duration?: number) => {
    trackEvent('video_call_ended', { duration });
  },

  // Emergency
  sosActivated: () => {
    trackEvent('sos_activated', { emergency: true });
  },
};

/**
 * Set user properties (user ID, etc.)
 */
export const setUserProperties = (userId: string, properties?: Record<string, any>): void => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('set', { user_id: userId });
  if (properties) {
    window.gtag('set', properties);
  }
};

/**
 * Clear user properties (on logout)
 */
export const clearUserProperties = (): void => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('set', { user_id: null });
};

