import express, { Request, Response } from 'express';
import { ADMIN, isLoggedIn, SUPER_ADMIN } from '../../middlewares/auth';

import httpStatus from 'http-status';
import { createUserAndSendDataWithPagination, importExcelFromClient, sendUsersToClient } from '../controllers/UserController';

const router = express.Router();

/**
 * ORGANIZATION
 */

router.get('/', isLoggedIn(), sendUsersToClient);

router.get('/with-pagination', isLoggedIn([ADMIN, SUPER_ADMIN]), sendUsersToClient);
router.post('/with-pagination', isLoggedIn([ADMIN, SUPER_ADMIN]), createUserAndSendDataWithPagination);
router.post('/import-excel', isLoggedIn([ADMIN, SUPER_ADMIN]), importExcelFromClient);

router.delete('/with-pagination/linkedChildren/:idMongoose', (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));
export default router;
