import express from 'express';

const router = express.Router();
import { createCheck, sendCheckToClient, verifyNonceCookieSendChecksMaintenanceToClient } from '../controllers/CheckController';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';
import { queryHandler } from '../../middlewares/handleSetQuery';

router.post('/:checkType', createCheck);
router.get('/:linkId/:idMongoose', verifyNonceCookieSendChecksMaintenanceToClient);
router.use(handleUserFromRequest);
router.use(queryHandler);

router.get('/:idMongoose', sendCheckToClient);
router.get('/show-file/:idMongoose', sendCheckToClient);

export default router;
