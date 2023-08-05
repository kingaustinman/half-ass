import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { Logger } from '@indigo/logger';
import { MiddyfiedHandler } from '@middy/core';

const logger = new Logger();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlainHandler = (event: any, context: unknown) => Promise<unknown> | unknown;

export interface IRoutes {
  [key: string]: MiddyfiedHandler | PlainHandler;
}

export const apigRouteKeyProvider = (routeKey: string): string => {
  const [method, path] = routeKey.split(/\s+/);
  return `${path}::${method}`;
};

export const apigHandlerRouter = (
  routes: IRoutes
): ((event: APIGatewayProxyEventV2, context: Context) => Promise<unknown>) => {
  return async (event: APIGatewayProxyEventV2, context: Context) => {
    const key = apigRouteKeyProvider(event.routeKey);

    const action = routes[key];

    if (!action) {
      const errorMsg = `apigHandlerRouter: Route ${event.routeKey} is undefined.`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    logger.info(`apigHandlerRouter: ${key}`);
    return action(event, context);
  };
};
