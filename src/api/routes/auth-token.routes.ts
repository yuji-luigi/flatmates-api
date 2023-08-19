import express, { Request, Response } from 'express';

const router = express.Router();

import { sendAuthTokenByIdsToClient, sendLinkIdToClient, verifyPinAndSendUserToClient } from '../controllers/AuthTokenController';
import { sendNotImplemented } from '../controllers/CrudController';

router.get('/', (req: Request, res: Response) => {
  res.send('API is working');
});

// GENERIC crud routes
router.get('/:idMongoose', sendLinkIdToClient);
router.get('/:entity/with-pagination', sendNotImplemented);
router.get('/:linkId/:idMongoose', sendAuthTokenByIdsToClient);
// VERIF NONCE/PIN
router.post('/verify-pin/:linkId/:idMongoose/users', verifyPinAndSendUserToClient);

router.put('/:linkId/:idMongoose', sendNotImplemented);
router.post('/:entity/with-pagination', sendNotImplemented);

router.delete('/:linkId/:idMongoose', sendNotImplemented);
router.get('/:entity/with-pagination', sendNotImplemented);

// GENERIC DATA TABLE/PAGINATION GET ROUTE

export default router;
