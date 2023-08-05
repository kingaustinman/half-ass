import { ALBEvent, ALBResult } from 'aws-lambda';
import { Logger } from '@indigo/logger';
import middy from '@middy/core';
import { httpErrorResponse } from '../apigw';
import { validateToken } from '../auth';
import { IJWTRequestContext, ITokenPayload } from '../auth/types';

const logger = new Logger();

export const jwtGuardMiddleware = (
  securePaths: string[] | undefined,
  userPoolId: string,
  jwtAudience: string[] | undefined,
  jwtScope: string | undefined
): middy.MiddlewareObj<ALBEvent, ALBResult> => {
  return {
    before: async (req: middy.Request<ALBEvent, ALBResult>) => {
      const requestPath = `${req.event.path}::${req.event.httpMethod}`;
      logger.debug('JWT Guard Middleware', { event: req.event, securePaths, jwtAudience, requestPath });

      // If securePaths undefined, match all paths, otherwise match from that array
      if (securePaths === undefined || securePaths.includes(requestPath)) {
        logger.info('Secure route matched. Validating token', { requestPath });
        const { headers } = req.event;
        const authenticationHeader: string = headers?.authorization ?? headers?.Authorization ?? '';

        const token = authenticationHeader.slice('Bearer '.length);
        try {
          const tokenPayload = (await validateToken(
            token,
            userPoolId,
            jwtAudience,
            jwtScope,
            'access'
          )) as ITokenPayload;
          (req.event.requestContext as IJWTRequestContext).token = tokenPayload;
        } catch (err) {
          logger.warn('Could not verify token', { error: (err as Error).message });
          req.response = httpErrorResponse(401, 401, 'Unauthorized', undefined, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,HEAD',
            'Access-Control-Allow-Headers':
              'Content-Type,X-Amz-Date,Authorization,Origin,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,x-trace-id,x-id-token'
          });
        }
      }
    }
  };
};
