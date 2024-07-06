import express from 'express';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
import { removeUserFromUnit, sendUnitsWithAuthToken } from '../controllers/UnitController';
const router = express.Router();

export const cache = new Map();

router.get('/auth-tokens', isLoggedIn(), sendUnitsWithAuthToken);
router.get('/auth-tokens/:idMongoose', isLoggedIn(), (_req, res) => res.send('send unit with auth token by id'));

router.delete('/:idMongoose/users', removeUserFromUnit);

export default router;
