import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../ApiError';
import { IAppErrorProps } from '../AppError';
import { ErrorCode } from '../errorCodes';

export class AuthNoTokenError extends ApiError {
  constructor(message: string, props: IAppErrorProps) {
    super(message, ErrorCode.AUTH_NO_TOKEN, StatusCodes.UNAUTHORIZED, props);
  }
}
