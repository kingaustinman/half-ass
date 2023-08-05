import { ALBEvent } from 'aws-lambda';

// aws-lambda signature is missing pathParameters field
export interface ApiEvent extends ALBEvent {
  pathParameters: { [name: string]: string };
}
