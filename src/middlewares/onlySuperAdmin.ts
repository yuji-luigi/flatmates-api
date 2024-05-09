import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { RequestCustom } from '../types/custom-express/express-custom';

export const onlySuperAdmin = (req: RequestCustom, res: Response, next: NextFunction) => {
  req.user?.isSuperAdmin ? next() : res.status(httpStatus.UNAUTHORIZED).send('Unauthorized access.');
};
