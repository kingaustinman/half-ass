import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AuthBadCredentialsError } from '@half-ass/common-node-errors';
import { Logger } from '@half-ass/common-node-logger';

type LambdaFunctionUrlEvent = APIGatewayProxyEventV2;
type LambdaFunctionUrlResult = APIGatewayProxyStructuredResultV2;

const log = new Logger();

export async function handler(event: LambdaFunctionUrlEvent, context: Context): Promise<LambdaFunctionUrlResult> {
  log.info('this is event: ', { event, context });
  try {
    throw new AuthBadCredentialsError('auth bad credentials', { errorData: event });
  } catch (err) {
    log.error('there was an error printing out the function name', { error: err });
  }
  console.log(context.functionName);
  console.log('austin1');
  try {
    console.log(`event: ${JSON.stringify(event)}`);
  } catch (err) {
    log.error('there was an error printing out the function name', { error: err });
  }
  console.log('austin3');
  return {
    statusCode: 200,
    body: JSON.stringify(event, null, 2)
  };
}
