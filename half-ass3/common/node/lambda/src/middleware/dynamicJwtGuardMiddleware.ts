import { ALBEvent, ALBResult } from 'aws-lambda';
import { verifyM2MToken } from '@indigo/auth';
import { Logger } from '@indigo/logger';
import middy from '@middy/core';
import { isSecureRoute, unauthorizedResponse } from './utils';
import { IJWTRequestContext } from '../auth';
import { ApiEvent, SecureRoute } from '../interfaces';

const logger = new Logger();

export const dynamicJwtGuard = (routes?: SecureRoute<ApiEvent>[]): middy.MiddlewareObj<ALBEvent, ALBResult> => {
  return {
    before: async (req: middy.Request<ALBEvent, ALBResult>) => {
      logger.info('JWT Guard Middleware', { event: req.event, routes });

      const projectName = process.env.projectName as string;
      const applicationName = process.env.applicationName as string;

      if (isSecureRoute(req, routes)) {
        logger.info('Secure route matched. Validating M2M token');
        const { headers } = req.event;
        const authenticationHeader: string = headers?.authorization ?? headers?.Authorization ?? '';

        const token = authenticationHeader.slice('Bearer '.length);
        try {
          const tokenPayload = await verifyM2MToken(projectName, applicationName, token);
          (req.event.requestContext as IJWTRequestContext).token = tokenPayload;
        } catch (err) {
          const error = err as Error;
          logger.error('Could not verify token', { error: error.message, stack: error.stack });
          req.response = unauthorizedResponse;
        }
      }
    }
  };
};
