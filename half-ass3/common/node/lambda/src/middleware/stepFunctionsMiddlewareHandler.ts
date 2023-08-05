import middy from '@middy/core';
// import httpErrorHandler from '@middy/http-error-handler';
// import httpJsonBodyParser from '@middy/http-json-body-parser';

import { tracingMiddlewares } from './tracingMiddlewareHandler';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stepFunctionsMiddlewareHandler: any = (
  mainHandler: (event: unknown, context: unknown) => Promise<unknown>
) => middy(mainHandler).use(tracingMiddlewares);
