import express, { Request, Response } from 'express';
import { ADMIN, LOGGED_USER, SUPER_ADMIN } from '../../middlewares/auth-middlewares';
import {
  deleteOrganizationByIdWithPagination,
  deleteOrganizationCookie,
  organizationSelected,
  sendAllOrganizations,
  sendOrganizations,
  sendOrganizationsSelectionForSuperAdmin,
  sendOrganizationsWithPagination,
  updateOrganizationById
} from '../controllers/OrganizationController';
import httpStatus from 'http-status';
import { isLoggedIn } from '../../middlewares/isLoggedIn';

const router = express.Router();

/**
 * ORGANIZATION
 */

router.get('/', isLoggedIn(), sendOrganizations);
router.get('/with-pagination', isLoggedIn(), sendOrganizationsWithPagination);
// make sure that the super admin can see all the organizations
router.get('/all', isLoggedIn([SUPER_ADMIN]), sendAllOrganizations);
router.get('/selections/super-admin', isLoggedIn([SUPER_ADMIN]), sendOrganizationsSelectionForSuperAdmin);
router.get('/cookie/:organizationId', isLoggedIn(), organizationSelected);

router.put('/:organizationId', isLoggedIn(), updateOrganizationById);
// COOKIE
router.delete('/cookie', isLoggedIn(), deleteOrganizationCookie);
router.delete('/with-pagination/:organizationId', isLoggedIn(), deleteOrganizationByIdWithPagination);
router.delete('/:organizationId', isLoggedIn(), deleteOrganizationByIdWithPagination);
router.delete('/with-pagination/linkedChildren/:idMongoose', (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));
export default router;
