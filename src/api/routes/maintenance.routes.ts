import express from 'express';
import { getPublicCrudObjects } from '../controllers/CrudController';
import maintenanceCtrl from '../controllers/MaintenanceController';
import { sendCrudObjectsWithPaginationToClient } from '../controllers/DataTableController';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
const router = express.Router();
// notify maintainer by email
// todo: create /notify-maintainer-by-email route: differentiate notify and not notify
router.post('/', isLoggedIn(), maintenanceCtrl.createMaintenance);

router.get('/with-pagination', isLoggedIn(), sendCrudObjectsWithPaginationToClient);
router.get('/:maintenanceId', isLoggedIn(), maintenanceCtrl.sendSingleMaintenanceToFrondEnd);
router.get('/', isLoggedIn(), maintenanceCtrl.sendMaintenancesToFrondEnd);
// router.post('/auth/file-upload/:linkId/:idMongoose', authUserMaintenanceFiles);

router.delete('/:maintenanceId', isLoggedIn(), maintenanceCtrl.deleteThread);

// todo: available only certain entities
router.get('/', getPublicCrudObjects);
// router.get('/mail', getPublicCrudObjects);

export default router;
