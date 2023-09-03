import express from 'express';
import maintainerCtrl, { removeSpaceFromMaintainerById, sendMaintainersOfBuildingToClient } from '../controllers/MaintainerController';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
const router = express.Router();
router.get('/test/test', (req, res) => res.send('API is working: maintainer.routes.tsd'));

router.get('/with-pagination', isLoggedIn(), maintainerCtrl.sendMaintainersWithPaginationToClient);
router.get('/slug/:slug', isLoggedIn(), maintainerCtrl.sendSingleMaintainerBySlug);

router.post('/with-pagination', isLoggedIn(), maintainerCtrl.createMaintainer);
router.put('/:idMongoose', isLoggedIn(), maintainerCtrl.updateMaintainerById);

router.get('/spaces', isLoggedIn(), sendMaintainersOfBuildingToClient);
router.delete('/spaces', isLoggedIn(), removeSpaceFromMaintainerById);

// router.put('/', is)

// router.get('/:maintenanceId', isLoggedIn(), maintenanceCtrl.sendSingleMaintenanceToFrondEnd);
// // todo: available only certain entities
// router.get('/', getPublicCrudObjects);
export default router;
