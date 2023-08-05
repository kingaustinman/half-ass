/* eslint-disable @typescript-eslint/no-explicit-any */
import { ALBEvent, ALBResult } from 'aws-lambda';
import { BaseError, ErrorCodes } from '@indigo/hierarchical-errors';
import { Logger, OpenTelemetryLogger } from '@indigo/logger';
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';

const openTelemetryTracing = (): middy.MiddlewareObj<ALBEvent, ALBResult, BaseError> => {
  const otelTracing = new OpenTelemetryLogger();
  otelTracing.start();
  const logger = new Logger();

  return {
    before: async (request: middy.Request<ALBEvent, ALBResult, BaseError>) => {
      const headers = request.event?.headers;

      // If there is no incoming traceId / spanId generate them
      if (!headers?.traceparent) {
        otelTracing.initializeSpan(process.env.LOGGER_SERVICE || 'aws-service');
      }

      // Set the ENV variables with tracing info
      otelTracing.setContextEnvironment(headers);
    },
    after: async (request: middy.Request<ALBEvent, ALBResult, BaseError>): Promise<void> => {
      if (request?.response?.headers) {
        const traceHeaders = otelTracing.injectHeaders(); // Turn the otel context into a header variable
        logger.info('response trace header', { traceHeaders });
        request.response.headers = { ...request.response.headers, ...traceHeaders };
      }

      // Clear static trace info
      otelTracing.endCurrentSpan();
      otelTracing.clearContextEnvironment();
    },
    onError: async (request: middy.Request<ALBEvent, ALBResult, BaseError>) => {
      const { error } = request;
      const traceHeaders = otelTracing.injectHeaders(); // Turn the otel context into a header variable
      logger.info('error trace header', { traceHeaders });
      const headers = {
        ...(request.response?.headers ?? {}),
        ...traceHeaders,
        'Content-Type': 'application/json'
      };
      request.response = {
        statusCode: error?.statusCode || ErrorCodes.DEFAULT_STATUS_CODE,
        headers,
        body: JSON.stringify({
          errorCode: error?.errorCode || ErrorCodes.UNKNOWN_ERROR_CODE,
          message: error?.message || ErrorCodes.UNKNOWN_ERROR_MESSAGE
        })
      };

      // Clear static trace info
      otelTracing.endCurrentSpan();
      otelTracing.clearContextEnvironment();
    }
  };
};

export const tracingMiddlewares: middy.MiddlewareObj<any, any, any>[] = [
  openTelemetryTracing(),
  doNotWaitForEmptyEventLoop()
];

export const tracingMiddlewareHandler: (
  mainHandler: (event: any, context: any) => Promise<any>
) => middy.MiddyfiedHandler<any, any, Error> = (mainHandler: (event: any, context: any) => Promise<any>) =>
  middy(mainHandler).use(tracingMiddlewares);
