import express from 'express';

const router = express.Router();
import { createCheck, sendCheckToClient, verifyNonceCookieSendChecksMaintenanceToClient } from '../controllers/CheckController';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';
import { queryHandler } from '../../middlewares/handleSetQuery';

router.post('/', createCheck);
router.put('/:idMongoose', (req, res) => res.status(500).json({ message: 'not implemented' }));
router.get('/:linkId/:idMongoose', verifyNonceCookieSendChecksMaintenanceToClient);
router.use(handleUserFromRequest);
router.use(queryHandler);

// router.get('/:idMongoose', sendCheckToClient);
router.get('/:idMongoose/with-nonce', sendCheckToClient);
// router.get('/show-file/:idMongoose', sendCheckToClient);

export default router;
