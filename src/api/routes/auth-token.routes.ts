import express, { Request, Response } from 'express';

const router = express.Router();

import {
  generateNewAuthTokenForEntity,
  sendAuthTokenByIdsToClient,
  sendLinkIdToClient,
  verifyPinAndSendUserToClient
} from '../controllers/AuthTokenController';
import { sendNotImplemented } from '../controllers/CrudController';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';
import { queryHandler } from '../../middlewares/handleSetQuery';
import { ADMIN } from '../../middlewares/auth-middlewares';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
import { authUserMaintenanceByJWT, authUserMaintenanceFiles, checkIsActiveMaintainerFromClient } from '../controllers/MaintenanceController';

router.get('/', (req: Request, res: Response) => {
  res.send('API is working');
});

// not authenticated route
router.post('/verify-pin/:linkId/:idMongoose/users', verifyPinAndSendUserToClient);

router.get('/maintenances/file-upload/:linkId/:idMongoose', isLoggedIn(), authUserMaintenanceByJWT);
// the auth-token associated to maintenance but need to check if the maintainer is active and valid.
router.post('/maintenances/check/maintainer/:linkId/:idMongoose', checkIsActiveMaintainerFromClient);
router.post('/maintenances/file-upload/:linkId/:idMongoose', authUserMaintenanceFiles);

router.use(handleUserFromRequest);
router.use(queryHandler);

// GENERIC crud routes
router.get('/:idMongoose', sendLinkIdToClient);
router.get('/:entity/with-pagination', sendNotImplemented);
router.get('/:linkId/:idMongoose', sendAuthTokenByIdsToClient);
// VERIF NONCE/PIN

router.put('/:linkId/:idMongoose', sendNotImplemented);
router.post('/:entity/with-pagination', sendNotImplemented);

router.post('/generate-new/:entity/:idMongoose', isLoggedIn(), generateNewAuthTokenForEntity);

router.delete('/:linkId/:idMongoose', sendNotImplemented);

// GENERIC DATA TABLE/PAGINATION GET ROUTE

export default router;
