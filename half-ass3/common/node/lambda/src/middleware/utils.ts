import { ALBEvent, ALBResult } from 'aws-lambda';
import middy from '@middy/core';
import { httpErrorResponse } from '../apigw';
import { ApiEvent, SecureRoute } from '../interfaces';

const regexpDynamicWildcards = /\/\{(proxy)\+\}$/;
const regexpDynamicParameters = /\/\{([^/]+)\}/g;

export const unauthorizedResponse = httpErrorResponse(401, 401, 'Unauthorized', undefined, {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,HEAD',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,Origin,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,x-trace-id,x-id-token'
});

// This is how middy assigns and compares dynamic routes that contain path variables /{var}
export const extractDynamicRouteExpression = (routePath: string): RegExp => {
  const cleanPath = routePath
    .replace(regexpDynamicWildcards, '/?(?<$1>.*)')
    .replace(regexpDynamicParameters, '/(?<$1>[^/]+)');
  return new RegExp(`^${cleanPath}$`);
};

export const matchPaths = (routePath: string, eventPath: string): boolean => {
  if (routePath.indexOf('{') >= 0) {
    const routePathRegExp = extractDynamicRouteExpression(routePath);
    const routeMatches = eventPath.match(routePathRegExp);
    return routeMatches !== null && routeMatches.includes(eventPath);
  }
  return routePath === eventPath;
};

export const isSecureRoute = (req: middy.Request<ALBEvent, ALBResult>, routes?: SecureRoute<ApiEvent>[]): boolean =>
  routes === undefined ||
  routes?.find((route) => {
    const methodsMatch = route.method === req.event.httpMethod;
    const routesMatch = matchPaths(route.path, req.event.path);

    return methodsMatch && routesMatch && route.secured;
  }) !== undefined;
