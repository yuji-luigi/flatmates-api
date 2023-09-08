// import { errors } from 'express-validation';
import { INTERNAL_SERVER_ERROR } from 'http-status';

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
 * @extends ErrorEx
 */
class APIError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  message?: string;
  errors?: any;
  status?: string | number;
  isPublic?: boolean;
  stack?: string;
  constructor({ message, errors, stack, status = INTERNAL_SERVER_ERROR, isPublic = false }: APIError) {
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.stack = stack;
  }
}

export default APIError;
