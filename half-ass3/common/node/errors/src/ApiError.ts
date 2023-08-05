import { StatusCodes } from 'http-status-codes';
import { AppError, IAppErrorProps } from './AppError';
import { ErrorCode } from './errorCodes';

export abstract class ApiError extends AppError {
  errorCode: ErrorCode;
  httpStatus: StatusCodes;

  constructor(message: string, errorCode: ErrorCode, httpStatus: StatusCodes, props?: IAppErrorProps) {
    super(message, props);
    this.errorCode = errorCode;
    this.httpStatus = httpStatus;
  }
}
