import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { RequestCustom } from '../types/custom-express/express-custom';
import { USER_ROLES } from '../types/enum/enum';
import { _MSG } from '../utils/messages';
import { SUPER_ADMIN, stringifyAdmins, ADMIN } from './auth-middlewares';

export const isLoggedIn =
  (roles: USER_ROLES[] = USER_ROLES) =>
  async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { user } = req;
    if (user) {
      if (user.role === SUPER_ADMIN) {
        return next();
      }
      const isAdminMainSpace = stringifyAdmins(req.space?.admins)?.includes(user._id.toString());
      if (roles.includes(ADMIN) && isAdminMainSpace) {
        return next();
      }
      if (roles.includes(user.role)) {
        return next();
      }
    }
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: _MSG.NOT_AUTHORIZED,
      user: null
    });
    // throw Error('user not authorized');
  };
