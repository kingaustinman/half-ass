import NestedError from 'nested-error-stacks';

export interface IAppErrorProps {
  nested?: Error;
  errorData?: object;
}
export abstract class AppError extends NestedError {
  errorData?: object;

  constructor(message: string, props?: IAppErrorProps) {
    super(message, props?.nested);
    this.errorData = props?.errorData;
  }
}
