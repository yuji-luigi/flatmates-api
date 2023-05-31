import express, { Request, Response } from 'express';

const router = express.Router();
import authCtrl from '../controllers/AuthController';
import {
  handleUserFromRequest,
  isLoggedIn
  // ADMIN,
  // LOGGED_USER,
  // SUPER_ADMIN
} from '../../middlewares/auth';

router.get('/', (req: Request, res: Response) => {
  res.send('auth routes');
});

// ALL ROUTES IS ALLOWED WHEN THE USER IS LOGGED IN
// USER CREATE ROUTE IS ALLOWED ONLY FOR ADMIN

router.post('/login', authCtrl.login);

router.post('/register', authCtrl.register);

router.get('/me', handleUserFromRequest, isLoggedIn(), authCtrl.me);

router.get('/logout', authCtrl.logout);

// router.post('/logout', authCtrl.logout);

export default router;
