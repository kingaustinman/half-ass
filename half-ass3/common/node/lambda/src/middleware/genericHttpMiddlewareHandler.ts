import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const genericHttpMiddlewareHandler: any = (
  mainHandler: (event: unknown, context: unknown) => Promise<unknown>
) => middy(mainHandler).use(httpErrorHandler());
