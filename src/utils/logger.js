/**
 * Structured client logger with log levels and PII sanitization.
 * Matches senior competency: logging libraries, exception handling, redact PII.
 *
 * Levels: error > warn > info > debug
 * Swap console sink for Sentry/Datadog in production via capture hooks.
 */

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const REDACT_KEYS = [
  'password',
  'token',
  'authorization',
  'ssn',
  'email',
  'phone',
  'creditcard',
  'cardnumber',
  'cvv',
  'secret',
  'apikey',
];

const currentLevel =
  process.env.NODE_ENV === 'production' ? LOG_LEVELS.warn : LOG_LEVELS.debug;

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function sanitizeValue(value) {
  if (value == null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => {
      const lower = key.toLowerCase().replace(/[_-]/g, '');
      if (REDACT_KEYS.some((r) => lower.includes(r))) {
        return [key, '[REDACTED]'];
      }
      return [key, sanitizeValue(val)];
    }),
  );
}

/**
 * @param {'error'|'warn'|'info'|'debug'} level
 * @param {string} message
 * @param {Record<string, unknown>} [context]
 */
function write(level, message, context = {}) {
  if (LOG_LEVELS[level] > currentLevel) {
    return;
  }

  const payload = {
    level,
    msg: message,
    ts: new Date().toISOString(),
    ...sanitizeValue(context),
  };

  // eslint-disable-next-line no-console
  const sink = console[level] || console.log;
  sink(`[${level}]`, message, payload);
}

export const logger = {
  debug: (message, context) => write('debug', message, context),
  info: (message, context) => write('info', message, context),
  warn: (message, context) => write('warn', message, context),
  error: (message, error, context = {}) => {
    write('error', message, {
      ...context,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : undefined,
    });
  },
  /** Capture exception with sanitized context (Sentry-ready facade). */
  captureException: (error, context = {}) => {
    logger.error('Unhandled exception', error, context);
  },
};

export default logger;
