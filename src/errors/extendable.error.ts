import { ApiErrorConstructor } from './api.error';

/**
 * @extends Error
 */

class ExtendableError extends Error {
  errors: object;
  status: string | number;
  isPublic?: boolean;
  isOperational?: boolean;

  constructor({
    message,
    errors,
    status,
    isPublic,
    stack
  }: ApiErrorConstructor) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    this.stack = stack;
    // Error.captureStackTrace(this, this.constructor.name);
  }
}

export default ExtendableError;
