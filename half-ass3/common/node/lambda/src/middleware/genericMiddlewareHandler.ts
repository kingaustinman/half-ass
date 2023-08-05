import middy from '@middy/core';

import { tracingMiddlewares } from './tracingMiddlewareHandler';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const genericMiddlewareHandler: any = (mainHandler: (event: unknown, context: unknown) => Promise<unknown>) =>
  middy(mainHandler).use(tracingMiddlewares);
