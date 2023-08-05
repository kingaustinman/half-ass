import { CognitoAccessTokenPayload, CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';
import { ALBEventRequestContext } from 'aws-lambda';

export interface CustomTokenPayload {
  username: string;
}

export type ITokenPayload = CognitoAccessTokenPayload;
export type IIDTokenPayload = CognitoIdTokenPayload;

export interface IJWTRequestContext extends ALBEventRequestContext {
  token: ITokenPayload;
  idToken: IIDTokenPayload;
}
