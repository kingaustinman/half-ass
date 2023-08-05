import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../ApiError';
import { IAppErrorProps } from '../AppError';
import { ErrorCode } from '../errorCodes';

export class PrincipalUnauthenticatedError extends ApiError {
  constructor(message: string, props: IAppErrorProps) {
    super(message, ErrorCode.PRINCIPAL_UNAUTHENTICATED, StatusCodes.UNAUTHORIZED, props);
  }
}
