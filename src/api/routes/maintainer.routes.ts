import express from 'express';
import {
  addMaintainerToSpace,
  addSpacesToMaintainer,
  createMaintainer,
  removeSpaceFromMaintainerById,
  sendMaintainersOfBuildingToClient,
  sendMaintainersToClient,
  sendMaintainersWithPaginationToClient,
  sendSingleMaintainerBySlug,
  updateMaintainerById
} from '../controllers/MaintainerController';
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
router.get('/test/test', (req, res) => res.send('API is working: maintainer.routes.tsd'));

router.get('/', isLoggedIn(), sendMaintainersToClient);
router.get('/with-pagination', isLoggedIn(), sendMaintainersWithPaginationToClient);
router.get('/slug/:slug', isLoggedIn(), sendSingleMaintainerBySlug);

router.post('/with-pagination', isLoggedIn(), createMaintainer);
router.post('/:idMaintainer/space/:idSpace', isLoggedIn(), addMaintainerToSpace);
router.put('/:idMongoose', isLoggedIn(), updateMaintainerById);
router.post('/:idMongoose/spaces', isLoggedIn(), addSpacesToMaintainer);

router.get('/spaces', isLoggedIn(), sendMaintainersOfBuildingToClient);
router.delete('/spaces', isLoggedIn(), removeSpaceFromMaintainerById);

// router.put('/', is)

// router.get('/:maintenanceId', isLoggedIn(), maintenanceCtrl.sendSingleMaintenanceToFrondEnd);
// // todo: available only certain entities
// router.get('/', getPublicCrudObjects);
export default router;
