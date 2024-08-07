import express, { NextFunction, Request, Response } from 'express';
// import { stringifyObjectIds } from '../../middlewares/auth-middlewares';
import logger from '../../lib/logger';
import httpStatus from 'http-status';
import {
  createUserAndSendDataWithPagination,
  importExcelFromClient,
  sendTokenEmail,
  sendUsersToClient,
  updateUserById,
  registerUserOnBoardingAndSendUserToClient,
  sendAuthTokenOfUserToClient,
  changeLocale
} from '../controllers/UserController';
import { RequestCustom as RequestCustomRoot } from '../../types/custom-express/express-custom';
import { deleteCrudObjectByIdAndSendDataWithPagination } from '../controllers/DataTableController';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
import MSG from '../../utils/messages';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import { SUPER_ADMIN } from '../../middlewares/auth-middlewares';

const router = express.Router();
interface RequestCustom extends RequestCustomRoot {
  user: ReqUser;
}
router.use((req: RequestCustom, response: Response, next: NextFunction) => {
  try {
    if (!req.user.isSuperAdmin && req.user.loggedAs.name === 'inhabitant') {
      if (!req.user.currentSpace?._id) {
        throw new Error('User must select a space first.');
      }
    }
    if (req.query.organization) {
      req.query.organizations = { $in: [req.query.organization] };
    }
    if (req.query.space) {
      // req.query.spaces = { $in: [req.user._id] };
    }
    // delete req.query.organization;
    // delete req.query.space;
    next();
  } catch (error) {
    logger.error(error.message || error);
    response.status(httpStatus.FORBIDDEN).json({ message: MSG().NOT_AUTHORIZED });
  }
});

/**
 * ORGANIZATION
 */

router.get('/', isLoggedIn([SUPER_ADMIN]), sendUsersToClient);

router.get('/with-pagination', isLoggedIn([SUPER_ADMIN]), sendUsersToClient);

router.get('/:idMongoose/send-token-email', isLoggedIn(), sendTokenEmail);

router.get('/:idMongoose/auth-tokens', isLoggedIn(), sendAuthTokenOfUserToClient);

router.post('/change-locale', isLoggedIn(), changeLocale);

router.post('/with-pagination', isLoggedIn(), createUserAndSendDataWithPagination);
router.post('/import-excel', isLoggedIn(), importExcelFromClient);

router.put('/:idMongoose', isLoggedIn(), compareTargetAndCurrentUser, updateUserById);

// need to set authentication for this route. the token checker.
router.put('/:idMongoose/on-boarding', isLoggedIn(), compareTargetAndCurrentUser, registerUserOnBoardingAndSendUserToClient);

router.delete('/with-pagination/:idMongoose', isLoggedIn(), deleteCrudObjectByIdAndSendDataWithPagination);

router.delete('/with-pagination/linkedChildren/:idMongoose', (_req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));
export default router;

async function compareTargetAndCurrentUser(req: RequestCustom, res: Response, next: NextFunction) {
  const { idMongoose } = req.params;
  const { user } = req;
  if (user.isSuperAdmin) {
    return next();
  }
  if (idMongoose === user._id.toString()) {
    return next();
  }
  return res.status(httpStatus.FORBIDDEN).send('forbidden');
}
