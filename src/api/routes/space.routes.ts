import express, { Request, Response } from 'express';
import { ADMIN, LOGGED_USER, SUPER_ADMIN } from '../../middlewares/auth-middlewares';
import {
  // createHeadSpace,

  createHeadSpaceWithPagination,
  deleteHeadSpaceWithPagination,
  sendSingleSpaceByIdToClient,
  sendDescendantIdsToClient,
  sendMainSpacesWithPaginationToClient,
  sendSingleSpaceToClientByCookie,
  sendSpaceSettingPageDataToClient,
  sendHeadToTailToClient,
  sendSpacesToClient,
  sendSpaceDataForHome,
  updateSpaceAndSendToClient
} from '../controllers/SpaceController';

import { createLinkedChild } from '../controllers/CrudCustomController';
import httpStatus from 'http-status';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
const router = express.Router();

router.get('/', isLoggedIn(), sendSpacesToClient);
router.get('/home', isLoggedIn(), sendSpaceDataForHome);
router.get('/with-pagination', isLoggedIn(), sendMainSpacesWithPaginationToClient);

router.get('/descendants/:spaceId', isLoggedIn(), sendDescendantIdsToClient);
router.get('/head-to-tail/:spaceId', isLoggedIn(), sendHeadToTailToClient);

// GET SINGLES
router.get('/single-by-cookie', isLoggedIn(), sendSingleSpaceToClientByCookie);
// router.get('/is-admin', isLoggedIn(), sendSingleSpaceToClientByCookie);

// todo: set ACL for this route
router.get('/:spaceId', isLoggedIn(), sendSingleSpaceByIdToClient);
router.get('/settings/:slug', isLoggedIn(), sendSpaceSettingPageDataToClient);

// CUSTOM crud ROUTES
// !deprecated moved to auth route

router.post('/with-pagination/linkedChildren/:parentId', isLoggedIn([ADMIN, SUPER_ADMIN]), createLinkedChild);
router.post('/with-pagination', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), createHeadSpaceWithPagination);
router.post('/', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));

router.put('/:idMongoose', isLoggedIn([ADMIN, SUPER_ADMIN]), updateSpaceAndSendToClient);

router.delete('/with-pagination/:spaceId', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), deleteHeadSpaceWithPagination);

router.delete('/:spaceId', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), deleteHeadSpaceWithPagination);

// for static site generation

export default router;
