import express, { Request, Response } from 'express';
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
  // sendDataForHomeDashboard,
  updateSpaceAndSendToClient,
  getLinkedChildrenSpaces
} from '../controllers/SpaceController';
import dataTableCtrl from '../controllers/DataTableController';

import { createLinkedChild } from '../controllers/CrudCustomController';
import httpStatus from 'http-status';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
import { RequestCustom } from '../../types/custom-express/express-custom';
const router = express.Router();

router.use((req: RequestCustom, res, next) => {
  if (req.user.isSuperAdmin) {
    return next();
  }
  if (!req.query.space) {
    return res.status(403).json({
      message: 'You need to specify a space'
    });
  }
  next();
});

router.get('/', isLoggedIn(), sendSpacesToClient);
// router.get('/home', isLoggedIn(), sendDataForHomeDashboard);
router.get('/with-pagination', isLoggedIn(), sendMainSpacesWithPaginationToClient);

router.get('/with-pagination/linkedChildren/:parentId', isLoggedIn(), getLinkedChildrenSpaces);

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

router.post('/with-pagination/linkedChildren/:parentId', isLoggedIn(), createLinkedChild);
router.post('/with-pagination', isLoggedIn(), createHeadSpaceWithPagination);
router.post('/', isLoggedIn(), (req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));

router.put('/:idMongoose', isLoggedIn(), updateSpaceAndSendToClient);

router.delete('/with-pagination/:spaceId', isLoggedIn(), deleteHeadSpaceWithPagination);

router.delete('/:spaceId', isLoggedIn(), deleteHeadSpaceWithPagination);
router.delete('/with-pagination/linkedChildren/:idMongoose', isLoggedIn(), dataTableCtrl.deleteLinkedChildByIdWithPagination);

// for static site generation

export default router;
