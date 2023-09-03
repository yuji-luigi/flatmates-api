import express from 'express';
import { getPublicCrudObjects } from '../controllers/CrudController';

import postController from '../controllers/PostController';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
const router = express.Router();

router.post('/', isLoggedIn(), postController.createThread);
router.put('/:threadId', isLoggedIn(), postController.updateThread);

router.get('/', isLoggedIn(), postController.sendThreadsToFrondEnd);
router.get('/with-pagination', isLoggedIn(), postController.sendThreadsToFrondEnd);
router.get('/:threadId', isLoggedIn(), postController.sendSingleThreadToFrondEnd);
router.delete('/:threadId', isLoggedIn(), postController.deleteThread);

// todo: available only certain entities
router.get('/', getPublicCrudObjects);

export default router;
