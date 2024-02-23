import express, { Request, Response } from 'express';
import crudCtrl from '../controllers/CrudController';
import dataTableCtrl, {
  createCrudObjectAndSendDataWithPagination,
  deleteCrudObjectByIdAndSendDataWithPagination
} from '../controllers/DataTableController';
import { checkEntity } from '../../middlewares/checkEntity';
import { isLoggedIn } from '../../middlewares/isLoggedIn';

const router = express.Router();
// import { createLinkedChild } from '../controllers/CrudCustomController';

router.get('/', (req: Request, res: Response) => {
  res.send('API is working');
});

// // GENERIC crud routes
router.get('/:entity', checkEntity, isLoggedIn(), crudCtrl.sendCrudDocumentsToClient);
// GENERIC DATA TABLE/PAGINATION GET ROUTE
router.get('/:entity/with-pagination', checkEntity, isLoggedIn(), dataTableCtrl.sendCrudObjectsWithPaginationToClient);
router.get('/:entity/:idMongoose', checkEntity, isLoggedIn(), crudCtrl.getSingleCrudObject);
router.get('/options/:entity/:idMongoose', checkEntity, isLoggedIn(), crudCtrl.getSingleCrudObject);

router.post('/:entity', checkEntity, isLoggedIn(), crudCtrl.createCrudObject);
router.post('/:entity/with-pagination', checkEntity, isLoggedIn(), createCrudObjectAndSendDataWithPagination);
// router.post('/:entity/with-pagination/linkedChildren/:parentId', checkEntity, isLoggedIn(), createLinkedChild);

router.put('/:entity/:idMongoose', checkEntity, isLoggedIn(), crudCtrl.updateCrudObjectById);

router.delete('/:entity/:idMongoose', checkEntity, isLoggedIn(), crudCtrl.deleteCrudObjectById);
router.delete('/:entity/with-pagination/:idMongoose', checkEntity, isLoggedIn(), deleteCrudObjectByIdAndSendDataWithPagination);
router.delete('/:entity/with-pagination/linkedChildren/:idMongoose', checkEntity, isLoggedIn(), dataTableCtrl.deleteLinkedChildByIdWithPagination);

export default router;
