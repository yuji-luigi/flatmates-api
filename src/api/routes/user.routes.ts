import express, { NextFunction, Request, Response } from 'express';
import { stringifyObjectIds } from '../../middlewares/auth-middlewares';

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
  if (!req.user.isSuperAdmin && req.user.loggedAs === 'inhabitant') {
    if (!req.user.spaceId) {
      return response.status(httpStatus.FORBIDDEN).send('something went wrong');
    }
    req.query.spaces = { $in: [req.user.spaceId] };
  }
  if (req.query.organization) {
    req.query.organizations = { $in: [req.query.organization] };
  }
  if (req.query.space) {
    req.query.spaces = { $in: [req.user.spaceId] };
  }
  delete req.query.organization;
  delete req.query.space;
  next();
});

/**
 * ORGANIZATION
 */

router.get('/', isLoggedIn(), sendUsersToClient);

router.get('/with-pagination', isLoggedIn(), sendUsersToClient);

router.get('/:idMongoose/send-token-email', isLoggedIn(), sendTokenEmail);

router.get('/:idMongoose/auth-tokens', isLoggedIn(), sendAuthTokenOfUserToClient);

router.post('/with-pagination', isLoggedIn(), createUserAndSendDataWithPagination);
router.post('/import-excel', isLoggedIn(), importExcelFromClient);

router.put('/:idMongoose', isLoggedIn(), compareTargetAndCurrentUser, updateUserById);

// need to set authentication for this route. the token checker.
router.put('/:idMongoose/on-boarding', isLoggedIn(), compareTargetAndCurrentUser, registerUserOnBoardingAndSendUserToClient);

router.delete('/with-pagination/:idMongoose', isLoggedIn(), deleteCrudObjectByIdAndSendDataWithPagination);

router.delete('/with-pagination/linkedChildren/:idMongoose', (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));
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
