// import { errors } from 'express-validation';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import ExtendableError from './extendable.error';

export type ErrorType = {
  error?: string;
  statusCode?: string;
  stack?: string;
  details?: string;
  status?: string;
  message?: string;
};

export interface ApiErrorConstructor {
  message?: string;
  errors?: any;
  stack?: any;
  status?: number | string;
  isPublic?: boolean;
  details?: string;
}
/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor({
    message,
    errors,
    stack,
    status = INTERNAL_SERVER_ERROR,
    isPublic = false
  }: ApiErrorConstructor) {
    super({
      message,
      errors,
      status,
      isPublic,
      stack
    });
  }
}

export default APIError;
