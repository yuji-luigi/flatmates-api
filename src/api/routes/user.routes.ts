import express, { NextFunction, Request, Response } from 'express';
import { ADMIN, stringifyObjectIds, SUPER_ADMIN } from '../../middlewares/auth-middlewares';

import httpStatus from 'http-status';
import {
  createUserAndSendDataWithPagination,
  importExcelFromClient,
  sendTokenEmail,
  sendUsersToClient,
  updateUserById,
  registerUserOnBoardingAndSendUserToClient,
  sendAuthTokenOfUserToClient
} from '../controllers/UserController';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { deleteCrudObjectByIdAndSendDataWithPagination } from '../controllers/DataTableController';
import { isLoggedIn } from '../../middlewares/isLoggedIn';

const router = express.Router();

router.use((req: RequestCustom, response: Response, next: NextFunction) => {
  if (req.user.role !== 'super_admin') {
    if (!req.user.spaceId) {
      return response.status(httpStatus.FORBIDDEN).send('something went wrong');
    }
    req.query.rootSpaces = { $in: [req.user.spaceId] };
  }
  // delete req.query.space;
  if (req.query.organization) {
    req.query.organizations = { $in: [req.query.organization] };
  }
  delete req.query.organization;
  delete req.query.space;
  next();
});

/**
 * ORGANIZATION
 */

router.get('/', isLoggedIn([ADMIN, SUPER_ADMIN]), sendUsersToClient);

router.get('/with-pagination', isLoggedIn([ADMIN, SUPER_ADMIN]), sendUsersToClient);

router.get('/:idMongoose/send-token-email', isLoggedIn([ADMIN, SUPER_ADMIN]), sendTokenEmail);

router.get('/:idMongoose/auth-tokens', isLoggedIn([ADMIN, SUPER_ADMIN]), sendAuthTokenOfUserToClient);

router.post('/with-pagination', isLoggedIn([ADMIN, SUPER_ADMIN]), createUserAndSendDataWithPagination);
router.post('/import-excel', isLoggedIn([ADMIN, SUPER_ADMIN]), importExcelFromClient);

router.put('/:idMongoose', isLoggedIn(), compareTargetAndCurrentUser, updateUserById);

// need to set authentication for this route. the token checker.
router.put('/:idMongoose/on-boarding', isLoggedIn(), compareTargetAndCurrentUser, registerUserOnBoardingAndSendUserToClient);

router.delete('/with-pagination/:idMongoose', isLoggedIn([ADMIN, SUPER_ADMIN]), deleteCrudObjectByIdAndSendDataWithPagination);

router.delete('/with-pagination/linkedChildren/:idMongoose', (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));
export default router;

async function compareTargetAndCurrentUser(req: RequestCustom, res: Response, next: NextFunction) {
  const { idMongoose } = req.params;
  const { user } = req;
  const isAdmin = user.role === SUPER_ADMIN || stringifyObjectIds(req.user.spaceAdmins)?.includes(user._id.toString());
  if (isAdmin) {
    return next();
  }
  if (idMongoose === user._id.toString()) {
    return next();
  }
  return res.status(httpStatus.FORBIDDEN).send('forbidden');
}
