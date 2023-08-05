import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Logger } from '@half-ass/common-node-logger';

const logger = new Logger();

export const validateToken = async (
  token: string,
  userPoolId: string,
  expectedAudience: string[] | undefined,
  expectedScope: string | undefined,
  tokenUse: 'id' | 'access'
  // @ts-expect-error: Type arguments type not exported from 3rd party library, so we can't specify.
): Promise<CognitoIdOrAccessTokenPayload> => {
  logger.debug('JWT TOKEN', { token });

  if (!userPoolId) {
    throw new Error('Could not get properties to validate id token against AWS.');
  }

  const verifier = CognitoJwtVerifier.create({
    userPoolId,
    tokenUse,
    clientId: expectedAudience,
    scope: expectedScope
  });

  try {
    const payload = await verifier.verify(token, { clientId: expectedAudience ?? null, scope: expectedScope });
    logger.debug('Token is valid.', { payload });

    return payload;
  } catch (err) {
    logger.debug('Token is invalid.', { err: (err as Error).message });
    throw err;
  }
};
