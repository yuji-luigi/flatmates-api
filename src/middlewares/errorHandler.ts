import { Request, Response, NextFunction } from 'express';
import { ErrorCustom } from '../lib/ErrorCustom';
import logger from '../lib/logger';

// Error handling Middleware functions
export const errorLogger = (error: ErrorCustom, _request: Request, _response: Response, next: NextFunction) => {
  logger.error(`error ${error.stack || error.message}`);

  error.internalLog && logger.error(`error ${error.internalLog}`);
  next(error); // calling next middleware
};

export const errorResponder = (error: ErrorCustom, _request: Request, response: Response, _next: NextFunction) => {
  response.header('Content-Type', 'application/json');

  const status = error.status || 400;
  response.status(status).send(error.message);
};

export const invalidPathHandler = (_request: Request, response: Response) => {
  response.status(400);
  response.send('invalid path');
};
