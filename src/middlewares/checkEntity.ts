import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import { getEntity } from '../utils/functions';
import logger from '../config/logger';
import { Entities } from '../types/mongoose-types/model-types/Entities';
import { entities } from '../types/mongoose-types/model-types/Entities';

const invalidEntities = ['auth-tokens', 'spaces', 'uploads', 'users'];

export const checkEntity = (req: Request, res: Response, next: NextFunction) => {
  // next();
  const entity = req.params.entity || getEntity(req.url);
  // req.params.entity = entity;
  if (invalidEntities.includes(entity)) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'invalid access' });
  }
  logger.info(`entity: ${entity}`);
  if (entities.includes(entity as Entities)) {
    return next();
  }
  logger.warn(`invalid entity access, entity: ${entity}`);
  res.status(httpStatus.OK).json({ message: entity });
};
