/* eslint-disable no-param-reassign */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getConfiguration } from '@indigo/auth';
import { Logger, OpenTelemetryLogger } from '@indigo/logger';

const logger = new Logger();

export const axiosTokensInterceptor = (projectName: string, applicationName: string) => {
  return async (config: InternalAxiosRequestConfig) => {
    const configuration = await getConfiguration(projectName, applicationName);
    logger.debug('Received config in interceptor', { configuration });
    if (configuration && configuration.clientDetails) {
      const accessToken = await getAccessToken(
        configuration?.clientDetails.clientId,
        configuration?.clientDetails.clientSecret
      );
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    //   logger.debug('Tried to add M2M token to the request', { config });

    const otel = new OpenTelemetryLogger();
    const traceparentHeader = otel.injectHeaders().traceparent;
    if (traceparentHeader) config.headers.traceparent = traceparentHeader;

    logger.debug('Tried to add traceparent to the request', { config });

    return config;
  };
};

export const createAuthenticatedApiClient = (
  baseURL: string,
  projectName: string,
  applicationName: string
): AxiosInstance => {
  const clientInstance = axios.create({
    baseURL
  });

  clientInstance.interceptors.request.use(axiosTokensInterceptor(projectName, applicationName));

  return clientInstance;
};
