import express, { Request, Response } from 'express';
import { ADMIN, isLoggedIn, LOGGED_USER, SUPER_ADMIN } from '../../middlewares/auth';
import { sendCrudObjectToLoggedClient } from '../controllers/CrudController';
import {
  // createHeadSpace,
  sendSpaceAsCookie,
  sendSpaceSelectionToClient,
  createHeadSpaceWithPagination,
  deleteHeadSpaceWithPagination,
  deleteSpaceCookie,
  sendSingleSpaceByIdToClient,
  sendDescendantIdsToClient,
  sendMainSpacesWithPaginationToClient
} from '../controllers/SpaceController';

import { sendLinkedChildrenWithPaginationToClient } from '../controllers/DataTableController';
import { createLinkedChild } from '../controllers/CrudCustomController';
import httpStatus from 'http-status';
const router = express.Router();

/**
 * SPACES
 */
// DATA TABLE
router.get('/', isLoggedIn(), sendCrudObjectToLoggedClient);
router.get('/descendants/:spaceId', isLoggedIn(), sendDescendantIdsToClient);
router.get('/with-pagination', isLoggedIn(), sendMainSpacesWithPaginationToClient);

router.get('/selections', isLoggedIn(), sendSpaceSelectionToClient);
router.get('/with-pagination/linkedChildren/:parentId', isLoggedIn(), sendLinkedChildrenWithPaginationToClient);
router.post('/with-pagination/linkedChildren/:parentId', isLoggedIn(), createLinkedChild);
router.get('/:spaceId', isLoggedIn(), sendSingleSpaceByIdToClient);

// CUSTOM crud ROUTES
router.get('/cookie/:spaceId', isLoggedIn(), sendSpaceAsCookie);
router.delete('/cookie', isLoggedIn(), deleteSpaceCookie);

router.post('/with-pagination', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), createHeadSpaceWithPagination);
router.post('/', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));

router.delete('/with-pagination/:spaceId', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), deleteHeadSpaceWithPagination);

router.delete('/:spaceId', isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), deleteHeadSpaceWithPagination);

export default router;
