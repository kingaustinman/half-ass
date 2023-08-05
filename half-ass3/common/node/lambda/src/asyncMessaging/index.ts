import { SNSMessage, SQSRecord } from 'aws-lambda';
import { Logger } from '@indigo/logger';
import { SQSConsumerJsonError } from '@indigo/message-constants';

export const parseSQSMessage = (record: SQSRecord): unknown => {
  const logger = new Logger();
  try {
    logger.silly('record body before parsing', { body: record.body });
    const message = JSON.parse(record.body);
    logger.debug('record body after parsing', { message });
    return message;
  } catch (err) {
    const error = new SQSConsumerJsonError(err as Error);
    logger.error('error parsing SQS record', { error, record });
    throw error;
  }
};

export const parseSNSMessage = (msg: SNSMessage): unknown => {
  const logger = new Logger();
  try {
    logger.silly('SNS Message before parsing', { Message: msg.Message });
    const message = JSON.parse(msg.Message);
    logger.debug('SNS Message after parsing', { message });
    return message;
  } catch (err) {
    const error = new SQSConsumerJsonError(err as Error);
    logger.error('error parsing SNS Message', { error, msg });
    throw error;
  }
};
