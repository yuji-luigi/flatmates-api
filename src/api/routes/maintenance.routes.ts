import express from 'express';
import { isLoggedIn } from '../../middlewares/auth';
import { getPublicCrudObjects } from '../controllers/CrudController';
import maintenanceCtrl, { authUserMaintenanceFiles } from '../controllers/MaintenanceController';
import { sendCrudObjectsWithPaginationToClient } from '../controllers/DataTableController';
const router = express.Router();
// notify maintainer by email
// todo: create /notify-maintainer-by-email route: differentiate notify and not notify
router.post('/', isLoggedIn(), maintenanceCtrl.createMaintenance);

router.get('/with-pagination', isLoggedIn(), sendCrudObjectsWithPaginationToClient);
router.get('/:maintenanceId', isLoggedIn(), maintenanceCtrl.sendSingleMaintenanceToFrondEnd);
router.get('/', isLoggedIn(), maintenanceCtrl.sendMaintenancesToFrondEnd);
router.post('/file-upload/:linkId/:idMongoose', authUserMaintenanceFiles);

router.delete('/:maintenanceId', isLoggedIn(), maintenanceCtrl.deleteThread);

// todo: available only certain entities
router.get('/', getPublicCrudObjects);
// router.get('/mail', getPublicCrudObjects);

export default router;
