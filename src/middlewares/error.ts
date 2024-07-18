import { Request, Response } from 'express';

import { ErrorType, ApiErrorConstructor } from '../errors/api.error';

import httpStatus from 'http-status';
import expressValidation from 'express-validation';
import APIError from '../errors/api.error';
import vars from '../utils/globalVariables';

const { env } = vars;

export type ConverterError = APIError | expressValidation.ValidationError;

/**
 * Error handler. Send stacktrace only during development
 * @public
 */

const handler = (err: any, _req: Request, res: Response) => {
  const response = {
    code: err.status,
    message: err.message,
    errors: err.errors,
    stack: err.stack
  };

  if (env !== 'development') {
    delete response.stack;
  }

  res.json(response);
};

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */

const converter = (err: ErrorType, req: Request, res: Response) => {
  let convertedError: ApiErrorConstructor = {};
  if (err instanceof expressValidation.ValidationError) {
    convertedError = new APIError({
      message: 'Validation Error',
      errors: err.error,
      status: err.statusCode,
      stack: err.stack,
      details: err.details
    });
  } else if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack,
      details: err.details
    });
  }

  return handler(convertedError, req, res);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
const notFound = (req: Request, res: Response) => {
  const err = new APIError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND
  });
  return handler(err, req, res);
};

export default {
  handler,
  converter,
  notFound
};
