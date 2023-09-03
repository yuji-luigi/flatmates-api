import express, { Request, Response } from 'express';
import { ADMIN, checkSSGSecret, isLoggedIn, LOGGED_USER, SUPER_ADMIN } from '../../middlewares/auth';
import {
  // createHeadSpace,
  sendSpaceAsCookie,
  sendSpaceSelectionToClient,
  createHeadSpaceWithPagination,
  deleteHeadSpaceWithPagination,
  deleteSpaceCookie,
  sendSingleSpaceByIdToClient,
  sendDescendantIdsToClient,
  sendMainSpacesWithPaginationToClient,
  sendSingleSpaceToClientByCookie,
  sendSpaceDataForHome,
  sendMainSpacesSlug,
  sendSingleSpaceBySlugToClient,
  sendHeadToTailToClient,
  sendSpacesToClient
} from '../controllers/SpaceController';

import { sendLinkedChildrenWithPaginationToClient } from '../controllers/DataTableController';
import { createLinkedChild } from '../controllers/CrudCustomController';
import httpStatus from 'http-status';
const router = express.Router();

router.get('/', isLoggedIn(), sendSpacesToClient);
// GET FOR DASHBOARD/HOME IN WEB APP
router.get('/home', isLoggedIn(), sendSpaceDataForHome);

// SSG PATHS
router.get('/static-props/:slug', checkSSGSecret, sendSpaceDataForHome);
router.get('/ssg-paths', checkSSGSecret, sendMainSpacesSlug);

router.get('/descendants/:spaceId', isLoggedIn(), sendDescendantIdsToClient);
router.get('/head-to-tail/:spaceId', isLoggedIn(), sendHeadToTailToClient);
router.get('/with-pagination', isLoggedIn(), sendMainSpacesWithPaginationToClient);

router.get('/selections', isLoggedIn(), sendSpaceSelectionToClient);
router.get('/with-pagination/linkedChildren/:parentId', isLoggedIn(), sendLinkedChildrenWithPaginationToClient);

// GET SINGLES
router.get('/single-by-cookie', isLoggedIn(), sendSingleSpaceToClientByCookie);
// todo: set ACL for this route
router.get('/:spaceId', isLoggedIn(), sendSingleSpaceByIdToClient);
router.get('/slug/:slug', isLoggedIn(), sendSingleSpaceBySlugToClient);

// CUSTOM crud ROUTES
router.get('/cookie/:spaceId', isLoggedIn(), sendSpaceAsCookie);
router.delete('/cookie', isLoggedIn(), deleteSpaceCookie);

router.post('/with-pagination/linkedChildren/:parentId', isLoggedIn([ADMIN, SUPER_ADMIN]), createLinkedChild);
router.post('/with-pagination', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), createHeadSpaceWithPagination);
router.post('/', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));

router.delete('/with-pagination/:spaceId', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), deleteHeadSpaceWithPagination);

router.delete('/:spaceId', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), deleteHeadSpaceWithPagination);

// for static site generation

export default router;
