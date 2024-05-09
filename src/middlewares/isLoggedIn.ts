import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { RequestCustom } from '../types/custom-express/express-custom';
import { _MSG } from '../utils/messages';
import { USER_ROLES } from '../types/enum/enum';
import { ErrorCustom } from '../lib/ErrorCustom';

export const isLoggedIn =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars


    (_roles: USER_ROLES[] = USER_ROLES) =>
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

export function isSuperAdmin(req: RequestCustom, _res: Response, next: NextFunction) {
  if (req.user?.isSuperAdmin) {
    return next();
  } else {
    next(new ErrorCustom(_MSG.NOT_AUTHORIZED, httpStatus.UNAUTHORIZED));
  }
}
