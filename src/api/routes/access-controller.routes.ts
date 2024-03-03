import express, { Request, Response } from 'express';
import { createAccessControllerAndSendToClient, sendAccessControllersToClient } from '../controllers/AccessControllerController';
import { onlySuperAdmin } from '../../middlewares/onlySuperAdmin';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
const router = express.Router();

export const cache = new Map();

router.get('/test', (req: Request, res: Response) => {
  res.send('accessPermission routes');
});

router.get('/', isLoggedIn(), sendAccessControllersToClient);
router.post('/', onlySuperAdmin, createAccessControllerAndSendToClient);
// ALL ROUTES IS ALLOWED WHEN THE USER IS LOGGED IN
// USER CREATE ROUTE IS ALLOWED ONLY FOR ADMIN

export default router;
