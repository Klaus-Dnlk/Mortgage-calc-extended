/**
 * C: Creates ecosystem for application state monitoring —
 * Thin monitoring facade (swap console for Sentry/New Relic in production).
 */
export const appMonitor = {
  /**
   * @param {string} event
   * @param {Record<string, unknown>} [payload]
   */
  track(event, payload = {}) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info('[monitor]', event, payload);
    }
    // Production: forward to Sentry/New Relic / analytics SDK
  },

  /**
   * @param {unknown} error
   * @param {Record<string, unknown>} [context]
   */
  captureError(error, context = {}) {
    // eslint-disable-next-line no-console
    console.error('[monitor:error]', error, context);
  },
};

export default appMonitor;
