import { SUPER_ADMIN } from './../../middlewares/auth';
import express, { Request, Response } from 'express';

const router = express.Router();
import crudCtrl from '../controllers/CrudController';
import dataTableCtrl, {
  createCrudObjectAndSendDataWithPagination,
  deleteCrudObjectByIdAndSendDataWithPagination
} from '../controllers/DataTableController';
import { isLoggedIn, ADMIN, LOGGED_USER } from '../../middlewares/auth';
import { checkEntity } from '../../middlewares/checkEntity';
import { createLinkedChild } from '../controllers/CrudCustomController';

router.get('/', (req: Request, res: Response) => {
  res.send('API is working');
});

// GENERIC crud routes
router.get('/:entity', checkEntity, isLoggedIn(), crudCtrl.sendCrudDocumentsToClient);
// GENERIC DATA TABLE/PAGINATION GET ROUTE
router.get('/:entity/with-pagination', isLoggedIn(), dataTableCtrl.sendCrudObjectsWithPaginationToClient);
router.get('/:entity/:idMongoose', checkEntity, isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), crudCtrl.getSingleCrudObject);
router.get('/options/:entity/:idMongoose', checkEntity, isLoggedIn(), crudCtrl.getSingleCrudObject);

router.post('/:entity', checkEntity, isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), crudCtrl.createCrudObject);
router.post('/:entity/with-pagination', checkEntity, isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), createCrudObjectAndSendDataWithPagination);
router.post('/:entity/with-pagination/linkedChildren/:parentId', checkEntity, isLoggedIn(), createLinkedChild);

router.put('/:entity/:idMongoose', checkEntity, isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), crudCtrl.updateCrudObjectById);

router.delete('/:entity/:idMongoose', checkEntity, isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), crudCtrl.deleteCrudObjectById);
router.delete(
  '/:entity/with-pagination/:idMongoose',
  checkEntity,
  isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]),
  deleteCrudObjectByIdAndSendDataWithPagination
);
router.delete(
  '/:entity/with-pagination/linkedChildren/:idMongoose',
  checkEntity,
  isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]),
  dataTableCtrl.deleteLinkedChildByIdWithPagination
);

export default router;
