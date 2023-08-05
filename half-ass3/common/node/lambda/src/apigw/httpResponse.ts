/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export interface IHttpResponseOptions {
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

type RequiredStatusCode = { statusCode: number };

const httpResponse = (
  statusCode: number,
  options?: IHttpResponseOptions
): APIGatewayProxyStructuredResultV2 & RequiredStatusCode => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    body: options?.body ? JSON.stringify(options.body) : undefined
  };
};

// TODO: Eliminate unknown type
export const httpSuccessResponse = (
  statusCode: number,
  body?: Record<string, unknown>
): APIGatewayProxyStructuredResultV2 & RequiredStatusCode => {
  return httpResponse(statusCode, { body });
};

export const httpErrorResponse = (
  statusCode: number,
  errorCode: number,
  message: string,
  data?: unknown,
  headers?: Record<string, string>
): APIGatewayProxyStructuredResultV2 & RequiredStatusCode => {
  return httpResponse(statusCode, {
    headers,
    body: {
      errorCode,
      message,
      data
    }
  });
};
