import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import { getEntity } from '../utils/functions';
import logger from '../config/logger';
import { Entities } from '../types/mongoose-types/model-types/Entities';

export const entities: Array<Entities> = [
  'bookmarks',
  // 'buildings',
  'comments',
  // 'floors',
  'funds',
  'fundRules',
  // 'instances',
  'proposals',
  'tags',
  'threads',
  'users',
  'userSettings',
  'wallets',
  'organizations',
  'notifications',
  // 'areas',
  'spaces',
  'maintenances',
  'maintainers'
];

export const checkEntity = (req: Request, res: Response, next: NextFunction) => {
  // next();
  const entity = req.params.entity || getEntity(req.url);
  // req.params.entity = entity;
  logger.info(`entity: ${entity}`);
  if (entities.includes(entity as Entities)) {
    return next();
  }
  logger.warn(`invalid entity access, entity: ${entity}`);
  res.status(httpStatus.UNAUTHORIZED).json({ message: 'entity does not exist' });
};
