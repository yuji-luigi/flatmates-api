import express, { Request, Response } from 'express';
import { ADMIN, isLoggedIn, SUPER_ADMIN } from '../../middlewares/auth';

import httpStatus from 'http-status';
import { createUserAndSendDataWithPagination, sendUsersToClient } from '../controllers/UserController';

const router = express.Router();

/**
 * ORGANIZATION
 */

router.get('/', isLoggedIn(), sendUsersToClient);
router.get('/with-pagination', isLoggedIn([ADMIN, SUPER_ADMIN]), sendUsersToClient);
router.post('/with-pagination', isLoggedIn([ADMIN, SUPER_ADMIN]), createUserAndSendDataWithPagination);
// router.get('/selections/super-admin', isLoggedIn([SUPER_ADMIN]), sendOrganizationsSelectionForSuperAdmin);
// router.get('/selected/:organizationId', isLoggedIn(), organizationSelected);

// router.put('/:organizationId', isLoggedIn(), updateOrganizationById);

// router.delete('/selected', isLoggedIn(), deleteOrganizationCookie);
// router.delete('/with-pagination/:organizationId', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), deleteOrganizationByIdWithPagination);
// router.delete('/:organizationId', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), deleteOrganizationByIdWithPagination);
router.delete('/with-pagination/linkedChildren/:idMongoose', (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));
export default router;
