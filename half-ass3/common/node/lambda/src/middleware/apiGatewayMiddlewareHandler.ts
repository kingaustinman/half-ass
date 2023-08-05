import middy from '@middy/core';
import httpCors, { Options } from '@middy/http-cors';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { tracingMiddlewares } from './tracingMiddlewareHandler';

export const defaultCorsOptions: Options = {
  credentials: false,
  methods: 'GET,POST,PATCH,PUT,DELETE,HEAD',
  headers: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,x-trace-id,x-id-token'
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiGatewayMiddlewareHandler: any = (mainHandler: (event: unknown, context: unknown) => Promise<unknown>) =>
  middy(mainHandler).use(httpJsonBodyParser()).use(httpCors(defaultCorsOptions)).use(tracingMiddlewares);
