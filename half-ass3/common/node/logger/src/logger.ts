import winston, { createLogger, format as winstonFormat, transports as winstonTransports } from 'winston';

import requestCtx from './requestCtx';

enum LogLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
  http = 'http',
  verbose = 'verbose',
  debug = 'debug',
  silly = 'silly'
}

let logLevel = LogLevel.info; // Default.

if (process.env.LOGGER_LEVEL) {
  const logLevelEnv = process.env.LOGGER_LEVEL.trim().toLowerCase();
  if (Object.keys(LogLevel).includes(logLevelEnv)) {
    logLevel = logLevelEnv as LogLevel;
  }
}

const defaultLogService = process.env.LOGGER_SERVICE || 'unspecified';

const errorToStackArray = (err: Error): string[] | string => {
  return err.stack ? err.stack.split('\n') : err.message;
};

export default class Logger {
  #logger: winston.Logger;

  constructor(defaultMeta?: { service: string }) {
    this.#logger =
      this.#logger ||
      createLogger({
        level: logLevel,
        format: winstonFormat.json(),
        defaultMeta: { service: defaultMeta?.service || defaultLogService, ...defaultMeta },
        transports: [new winstonTransports.Console()],
        exitOnError: false
      });
  }

  error(message: string, meta?: Record<string, unknown>): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let metaClone: any | undefined;
    if (meta) {
      metaClone = {};
      Object.entries(meta).forEach(([key, val]: [key: string, val: unknown]) => {
        metaClone[key] = val instanceof Error ? errorToStackArray(val) : val;
      });
    }

    this.#logger.error(message, {
      ...(metaClone || {}),
      cId: requestCtx().cId,
      requestTs: requestCtx().now.toISOString()
    });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.#logger.warn(message, {
      ...(meta || {}),
      cId: requestCtx().cId,
      requestTs: requestCtx().now.toISOString()
    });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.#logger.info(message, {
      ...(meta || {}),
      cId: requestCtx().cId,
      requestTs: requestCtx().now.toISOString()
    });
  }

  http(message: string, meta?: Record<string, unknown>): void {
    this.#logger.http(message, {
      ...(meta || {}),
      cId: requestCtx().cId,
      requestTs: requestCtx().now.toISOString()
    });
  }

  verbose(message: string, meta?: Record<string, unknown>): void {
    this.#logger.verbose(message, {
      ...(meta || {}),
      cId: requestCtx().cId,
      requestTs: requestCtx().now.toISOString()
    });
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.#logger.debug(message, {
      ...(meta || {}),
      cId: requestCtx().cId,
      requestTs: requestCtx().now.toISOString()
    });
  }

  silly(message: string, meta?: Record<string, unknown>): void {
    this.#logger.silly(message, {
      ...(meta || {}),
      cId: requestCtx().cId,
      requestTs: requestCtx().now.toISOString()
    });
  }

  isErrorEnabled() {
    return this.#logger.isErrorEnabled();
  }

  isWarnEnabled() {
    return this.#logger.isWarnEnabled();
  }

  isInfoEnabled() {
    return this.#logger.isInfoEnabled();
  }

  isHttpEnabled() {
    return this.#logger.isLevelEnabled('http');
  }

  isVerboseEnabled() {
    return this.#logger.isVerboseEnabled();
  }

  isDebugEnabled() {
    return this.#logger.isDebugEnabled();
  }

  isSillyEnabled() {
    return this.#logger.isSillyEnabled();
  }
}
