import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { RequestCustom } from '../types/custom-express/express-custom';
import { _MSG } from '../utils/messages';
import { USER_ROLES } from '../types/enum/enum';

export const isLoggedIn =
  (roles: USER_ROLES[] = USER_ROLES) =>
  async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { user } = req;
    if (user) {
      if (user.isSuperAdmin) {
        return next();
      }
      return next();
    }
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: _MSG.NOT_AUTHORIZED,
      user: null
    });
    // throw Error('user not authorized');
  };
