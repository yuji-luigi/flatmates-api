import express from 'express';

const router = express.Router();
import { sendNotificationsToClient } from '../controllers/NotificationiController';

router.get('/', sendNotificationsToClient);

export default router;
