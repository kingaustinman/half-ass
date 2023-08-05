import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../ApiError';
import { IAppErrorProps } from '../AppError';
import { ErrorCode } from '../errorCodes';

export class PrincipalForbiddenError extends ApiError {
  constructor(message: string, props: IAppErrorProps) {
    super(message, ErrorCode.PRINCIPAL_FORBIDDEN, StatusCodes.UNAUTHORIZED, props);
  }
}
