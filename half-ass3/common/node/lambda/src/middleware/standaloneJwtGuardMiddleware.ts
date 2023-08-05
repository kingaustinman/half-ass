import { CognitoAccessTokenPayload, CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { verifyTokenStandalone } from '@indigo/auth';
import { Logger } from '@indigo/logger';
import middy from '@middy/core';
import { isSecureRoute, unauthorizedResponse } from './utils';
import { IJWTRequestContext } from '../auth';
import { ApiEvent, SecureRoute } from '../interfaces';

const logger = new Logger();

export const standaloneJwtGuard = (
  userPoolId: string,
  allowedAudience: string[],
  routes?: SecureRoute<ApiEvent>[]
): middy.MiddlewareObj<ALBEvent, ALBResult> => {
  return {
    before: async (req: middy.Request<ALBEvent, ALBResult>) => {
      logger.info('JWT Guard Middleware. Verifying Access and ID tokens', { event: req.event, routes });

      if (isSecureRoute(req, routes)) {
        logger.info('Secure route matched. Validating token');
        const { headers } = req.event;
        const authenticationHeader: string = headers?.authorization ?? headers?.Authorization ?? '';

        const accessToken = authenticationHeader.slice('Bearer '.length);
        const idToken = headers?.['x-id-token'] as string;
        try {
          logger.info('Verifying Access Token', { accessToken });
          const accessTokenPayload = await verifyTokenStandalone(userPoolId, allowedAudience, 'access', accessToken);
          (req.event.requestContext as IJWTRequestContext).token = accessTokenPayload as CognitoAccessTokenPayload;

          logger.info('Verifying ID Token', { idToken });
          const idTokenPayload = await verifyTokenStandalone(userPoolId, allowedAudience, 'id', idToken);
          (req.event.requestContext as IJWTRequestContext).idToken = idTokenPayload as CognitoIdTokenPayload;

          logger.debug('Context with tokens', { context: req.event.requestContext });
        } catch (err) {
          const error = err as Error;
          logger.error('Could not verify tokens', { error: error.message, stack: error.stack });
          req.response = unauthorizedResponse;
        }
      }
    }
  };
};
