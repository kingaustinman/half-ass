import { Route } from '@middy/http-router';

export interface SecureRoute<TEvent> extends Route<TEvent> {
  secured?: boolean;
  scope?: string;
}
