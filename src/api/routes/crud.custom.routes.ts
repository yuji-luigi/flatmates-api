import express from 'express';
import { ADMIN, isLoggedIn, SUPER_ADMIN } from '../../middlewares/auth';
import { checkEntity } from '../../middlewares/checkEntity';
import { getPublicCrudObjects } from '../controllers/CrudController';
import { createLinkedChild, getLinkedChildren } from '../controllers/CrudCustomController';
import DataTableController from '../controllers/DataTableController';
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

/**
 * LINKED CHILDREN
 */
// DATA TABLE
router.get('/linkedChildren/:entity/:parentId', checkEntity, isLoggedIn(), getLinkedChildren);
// DATA TABLE
router.post('/linkedChildren/:entity/:parentId', checkEntity, isLoggedIn([ADMIN, SUPER_ADMIN]), createLinkedChild);

//DATA TABLE
router.delete('/linkedChildren/:entity/:linkedChildrenId/:parentId', checkEntity, isLoggedIn(), getLinkedChildren);

router.get('/uploads', isLoggedIn([SUPER_ADMIN]), DataTableController.sendCrudObjectsWithPaginationToClient);

/**
 * PUBLIC ROUTES
 *  */
// todo: available only certain entities
router.get('/public/threads', getPublicCrudObjects);
router.get('/public/spaces', getPublicCrudObjects);
router.get('/public/aaa', getPublicCrudObjects);

export default router;
