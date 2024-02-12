import express, { Request, Response } from 'express';
import { createAccessControllerAndSendToClient } from '../controllers/AccessController';
const router = express.Router();

export const cache = new Map();

router.get('/', (req: Request, res: Response) => {
  res.send('accessController routes');
});
router.post('/', createAccessControllerAndSendToClient);
// ALL ROUTES IS ALLOWED WHEN THE USER IS LOGGED IN
// USER CREATE ROUTE IS ALLOWED ONLY FOR ADMIN

export default router;
