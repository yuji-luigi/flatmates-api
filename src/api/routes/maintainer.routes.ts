import express from 'express';
import { isLoggedIn } from '../../middlewares/auth';
import maintainerCtrl from '../controllers/MaintainerController';
const router = express.Router();
router.get('/test/test', (req, res) => res.send('API is working: maintainer.routes.tsd'));

router.get('/with-pagination', isLoggedIn(), maintainerCtrl.sendMaintainersWithPaginationToClient);

router.post('/with-pagination', isLoggedIn(), maintainerCtrl.createMaintainer);
router.put('/:idMongoose', isLoggedIn(), maintainerCtrl.updateMaintainerById);
// router.put('/', is)

// router.get('/:maintenanceId', isLoggedIn(), maintenanceCtrl.sendSingleMaintenanceToFrondEnd);
// // todo: available only certain entities
// router.get('/', getPublicCrudObjects);
export default router;
