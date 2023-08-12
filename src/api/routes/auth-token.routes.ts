import express, { Request, Response } from 'express';

const router = express.Router();

import { sendAuthTokenByIdsToClient, sendLinkIdToClient } from '../controllers/AuthTokenController';

router.get('/', (req: Request, res: Response) => {
  res.send('API is working');
});

// GENERIC crud routes
router.get('/:idMongoose', sendLinkIdToClient);
router.get('/:linkId/:idMongoose', sendAuthTokenByIdsToClient);

// GENERIC DATA TABLE/PAGINATION GET ROUTE

export default router;
