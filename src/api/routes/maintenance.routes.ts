import express from 'express';
import { isLoggedIn } from '../../middlewares/auth';
import { getPublicCrudObjects } from '../controllers/CrudController';
import maintenanceCtrl from '../controllers/MaintenanceController';
import { sendCrudObjectsWithPaginationToClient } from '../controllers/DataTableController';
const router = express.Router();

router.post('/', isLoggedIn(), maintenanceCtrl.createMaintenance);

router.get('/with-pagination', isLoggedIn(), sendCrudObjectsWithPaginationToClient);
router.get('/:maintenanceId', isLoggedIn(), maintenanceCtrl.sendSingleMaintenanceToFrondEnd);
router.get('/', isLoggedIn(), maintenanceCtrl.sendMaintenancesToFrondEnd);
router.delete('/:maintenanceId', isLoggedIn(), maintenanceCtrl.deleteThread);

// todo: available only certain entities
router.get('/', getPublicCrudObjects);
// router.get('/mail', getPublicCrudObjects);

export default router;
