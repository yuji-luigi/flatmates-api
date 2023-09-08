class ErrorEx {
  name?: string;
  message?: string;
  detail?: string;
  stack?: string;
  errors?: object;
  status?: string | number;
  isPublic?: boolean;
  isOperational?: boolean;

  constructor({ name, message, errors, status, isPublic, stack, detail }: ErrorEx) {
    this.name = name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    this.stack = stack;
    this.detail = detail;
    // Error.captureStackTrace(this, this.constructor.name);
  }
}

export default ErrorEx;
