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

router.use(isLoggedIn());
router.use((req: RequestCustom, res, next) => {
  if (req.user?.isSuperAdmin) {
    return next();
  }
  if (!req.query.space) {
    return res.status(403).json({
      message: 'You need to specify a space'
    });
  }
  next();
});

router.get('/', sendSpacesToClient);
// router.get('/home',  sendDataForHomeDashboard);
router.get('/with-pagination', sendMainSpacesWithPaginationToClient);

router.get('/with-pagination/linkedChildren/:parentId', getLinkedChildrenSpaces);

router.get('/descendants/:spaceId', sendDescendantIdsToClient);
router.get('/head-to-tail/:spaceId', sendHeadToTailToClient);

// GET SINGLES
router.get('/single-by-cookie', sendSingleSpaceToClientByCookie);
// router.get('/is-admin',  sendSingleSpaceToClientByCookie);

// todo: set ACL for this route
router.get('/:spaceId', sendSingleSpaceByIdToClient);
router.get('/settings/:slug', sendSpaceSettingPageDataToClient);
router.post('/with-pagination/linkedChildren/:parentId', isLoggedIn(['system_admin', 'property_manager']), createLinkedChild);
router.post('/with-pagination', isLoggedIn(['system_admin', 'property_manager']), createHeadSpaceWithPagination);
router.post('/', (_req: Request, res: Response) => res.status(httpStatus.FORBIDDEN).send('forbidden'));

router.put('/:idMongoose', updateSpaceAndSendToClient);

router.delete('/with-pagination/:spaceId', deleteHeadSpaceWithPagination);

router.delete('/:spaceId', deleteHeadSpaceWithPagination);
router.delete('/with-pagination/linkedChildren/:idMongoose', dataTableCtrl.deleteLinkedChildByIdWithPagination);

// for static site generation

export default router;
