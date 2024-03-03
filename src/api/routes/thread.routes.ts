import express from 'express';
import { getPublicCrudObjects } from '../controllers/CrudController';

import postController from '../controllers/ThreadController';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
import { RequestCustom } from '../../types/custom-express/express-custom';
const router = express.Router();
router.use((req: RequestCustom, res, next) => {
  if (req.query.space) {
    req.query.spaces = { $in: [req.query.space] };
    delete req.query.space;
  }
  next();
});
router.post('/', isLoggedIn(), postController.createThread);
router.put('/:threadId', isLoggedIn(), postController.updateThread);

router.get('/', isLoggedIn(), postController.sendThreadsToFrondEnd);
router.get('/home', postController.sendPostsForHomeDashboard);
router.get('/with-pagination', isLoggedIn(), postController.sendThreadsToFrondEnd);
router.get('/:threadId', isLoggedIn(), postController.sendSingleThreadToFrondEnd);
router.delete('/:threadId', isLoggedIn(), postController.deleteThread);

// todo: available only certain entities
router.get('/', getPublicCrudObjects);

export default router;
