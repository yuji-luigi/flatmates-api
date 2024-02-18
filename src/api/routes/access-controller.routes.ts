import express, { Request, Response } from 'express';
import { createAccessControllerAndSendToClient } from '../controllers/AccessController';
import { onlySuperAdmin } from '../../middlewares/onlySuperAdmin';
const router = express.Router();

export const cache = new Map();

router.get('/test', (req: Request, res: Response) => {
  res.send('accessController routes');
});

router.get('/', createAccessControllerAndSendToClient);
router.post('/', onlySuperAdmin, createAccessControllerAndSendToClient);
// ALL ROUTES IS ALLOWED WHEN THE USER IS LOGGED IN
// USER CREATE ROUTE IS ALLOWED ONLY FOR ADMIN

export default router;
