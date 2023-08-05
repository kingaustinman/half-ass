/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { validateToken } from '../auth';

const xIdHeader = 'x-id-token';
const { userPoolId, authAppClientId } = process.env;

const xidToken = (): middy.MiddlewareObj => {
  return {
    before: async (req: any) => {
      const headers = req.event?.headers;
      const incomingXID = headers[xIdHeader];

      if (userPoolId && authAppClientId)
        await validateToken(incomingXID, userPoolId, [authAppClientId], undefined, 'id');
      else throw new Error('UserPoolId or ClientId does not exist.');
      // TODO: Replace this error with custom errors
    }
  };
};

export const tokenValidationMiddlewares: middy.MiddlewareObj[] = [xidToken(), doNotWaitForEmptyEventLoop()];

export const tokenValidationMiddlewareHandler: (
  mainHandler: (event: any, context: any) => Promise<any>
) => middy.MiddyfiedHandler<any, any, Error> = (mainHandler: (event: any, context: any) => Promise<any>) =>
  middy(mainHandler).use(tokenValidationMiddlewares);
