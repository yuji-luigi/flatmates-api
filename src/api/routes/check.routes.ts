import express from 'express';

const router = express.Router();
import { createCheck, sendCheckToClient } from '../controllers/CheckController';

router.get('/:idMongoose', sendCheckToClient);
router.get('/show-file/:idMongoose', sendCheckToClient);

router.post('/:checkType', createCheck);

export default router;
