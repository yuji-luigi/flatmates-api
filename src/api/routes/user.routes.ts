import express, { NextFunction, Request, Response } from 'express';
import { ADMIN, isLoggedIn, SUPER_ADMIN } from '../../middlewares/auth';

import httpStatus from 'http-status';
import { createUserAndSendDataWithPagination, importExcelFromClient, sendTokenEmail, sendUsersToClient } from '../controllers/UserController';
import { RequestCustom } from '../../types/custom-express/express-custom';
import CrudController from '../controllers/CrudController';

const router = express.Router();

/**
 * ORGANIZATION
 */

router.get('/', isLoggedIn(), sendUsersToClient);

router.get('/with-pagination', isLoggedIn([ADMIN, SUPER_ADMIN]), sendUsersToClient);

router.get('/send-token-email/:idMongoose', isLoggedIn([ADMIN, SUPER_ADMIN]), sendTokenEmail);
router.post('/with-pagination', isLoggedIn([ADMIN, SUPER_ADMIN]), createUserAndSendDataWithPagination);
router.post('/import-excel', isLoggedIn([ADMIN, SUPER_ADMIN]), importExcelFromClient);
router.put('/:idMongoose', isLoggedIn(), compareTargetAndCurrentUser, CrudController.updateCrudObjectById);
router.delete('/with-pagination/linkedChildren/:idMongoose', (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));
export default router;

async function compareTargetAndCurrentUser(req: RequestCustom, res: Response, next: NextFunction) {
  const { idMongoose } = req.params;
  const { user } = req;
  if (idMongoose === user._id.toString()) {
    next();
  } else {
    res.status(httpStatus.FORBIDDEN).send('forbidden');
  }
}
