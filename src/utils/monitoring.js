/**
 * C: Creates ecosystem for application state monitoring —
 * Thin monitoring facade backed by structured logger (Sentry-ready).
 */
import { logger } from './logger';

export const appMonitor = {
  /**
   * @param {string} event
   * @param {Record<string, unknown>} [payload]
   */
  track(event, payload = {}) {
    logger.info(event, payload);
  },

  /**
   * @param {unknown} error
   * @param {Record<string, unknown>} [context]
   */
  captureError(error, context = {}) {
    logger.captureException(error, context);
  },
};

export default appMonitor;
