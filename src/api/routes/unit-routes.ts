import express from 'express';
import { sendAccessControllersToClient } from '../controllers/AccessPermissionController';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
import { sendUnitsWithAuthToken } from '../controllers/UnitController';
const router = express.Router();

export const cache = new Map();

router.get('/auth-token', isLoggedIn(), sendUnitsWithAuthToken);
router.get('/auth-token/:idMongoose', isLoggedIn(), (_req, res) => res.send('send unit with auth token by id'));

export default router;
