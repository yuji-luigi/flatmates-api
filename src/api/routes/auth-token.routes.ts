import express, { Request, Response } from 'express';

const router = express.Router();

import { sendAuthTokenByIdsToClient, sendLinkIdToClient } from '../controllers/AuthTokenController';
import { sendNotImplemented } from '../controllers/CrudController';
import { send } from 'process';
import { not } from 'joi';

router.get('/', (req: Request, res: Response) => {
  res.send('API is working');
});

// GENERIC crud routes
router.get('/:idMongoose', sendLinkIdToClient);
router.get('/:entity/with-pagination', sendNotImplemented);
router.get('/:linkId/:idMongoose', sendAuthTokenByIdsToClient);

router.put('/:linkId/:idMongoose', sendNotImplemented);
router.post('', sendNotImplemented);
router.post('/:entity/with-pagination', sendNotImplemented);

router.delete('/:linkId/:idMongoose', sendNotImplemented);
router.get('/:entity/with-pagination', sendNotImplemented);

// GENERIC DATA TABLE/PAGINATION GET ROUTE

export default router;
