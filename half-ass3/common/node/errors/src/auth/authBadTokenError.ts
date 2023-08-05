import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../ApiError';
import { IAppErrorProps } from '../AppError';
import { ErrorCode } from '../errorCodes';

export class AuthBadTokenError extends ApiError {
  constructor(message: string, props: IAppErrorProps) {
    super(message, ErrorCode.AUTH_BAD_TOKEN, StatusCodes.UNAUTHORIZED, props);
  }
}
