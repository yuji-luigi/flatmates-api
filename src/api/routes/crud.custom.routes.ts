import express from 'express';
import { ADMIN, SUPER_ADMIN } from '../../middlewares/auth-middlewares';
import { checkEntity } from '../../middlewares/checkEntity';
import { getPublicCrudObjects } from '../controllers/CrudController';
import { createLinkedChild, deleteLinkedChild, getLinkedChildren, sendDataForHomeDashboard } from '../controllers/CrudCustomController';
import DataTableController from '../controllers/DataTableController';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
const router = express.Router();

// ! Todo: create users routes user can't be created by themselves with generic crud routes
// router.post('/users', checkEntity, isLoggedIn([ADMIN, SUPER_ADMIN]), CrudController.createCrudObject);
// router.put('/users/:idMongoose', checkEntity, isLoggedIn([ADMIN, SUPER_ADMIN]), CrudController.updateCrudObjectById);

// /**
//  * CUSTOMERS
//  */
// router.post('/customers', checkEntity, isLoggedIn([SUPER_ADMIN]), CrudController.createCrudObject);
// router.post('/customers/:idMongoose', checkEntity, isLoggedIn([SUPER_ADMIN]), CrudController.updateCrudObjectById);

// router.delete('/linkedChildren/:entity/:id', checkEntity, isLoggedIn([ADMIN, LOGGED_USER, SUPER_ADMIN]), deleteLinkedChild);
router.get('/home', isLoggedIn(), sendDataForHomeDashboard);

/**
 * LINKED CHILDREN
 */
// DATA TABLE
router.get('/:entity/with-pagination/linkedChildren/:parentId', checkEntity, isLoggedIn(), getLinkedChildren);
// DATA TABLE
router.post('/:entity/with-pagination/linkedChildren/:parentId', checkEntity, isLoggedIn([ADMIN, SUPER_ADMIN]), createLinkedChild);

//DATA TABLE
router.delete('/:entity/with-pagination/linkedChildren/:id', checkEntity, isLoggedIn(), deleteLinkedChild);

router.get('/uploads', isLoggedIn([SUPER_ADMIN]), DataTableController.sendCrudObjectsWithPaginationToClient);

/**
 * PUBLIC ROUTES
 *  */
// todo: available only certain entities
router.get('/public/threads', getPublicCrudObjects);
router.get('/public/spaces', getPublicCrudObjects);
router.get('/public/aaa', getPublicCrudObjects);

export default router;
