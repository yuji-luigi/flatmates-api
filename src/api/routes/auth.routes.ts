import express, { Request, Response } from 'express';

const router = express.Router();
import authCtrl, { sendMainSpaceSelectionsToClient, setSpaceAndOrgInJwt } from '../controllers/AuthController';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';
import { isLoggedIn } from '../../middlewares/isLoggedIn';

router.get('/', (req: Request, res: Response) => {
  res.send('auth routes');
});

// ALL ROUTES IS ALLOWED WHEN THE USER IS LOGGED IN
// USER CREATE ROUTE IS ALLOWED ONLY FOR ADMIN

router.post('/login', authCtrl.login);

router.post('/register', authCtrl.register);

router.get('/logout', authCtrl.logout);

// router.get('/static-props/:slug', checkSSGSecret, sendSpaceDataForHome);
// router.get('/ssg-paths', checkSSGSecret, sendMainSpacesSlug);

router.use(handleUserFromRequest);
router.get('/space-selections', isLoggedIn(), sendMainSpaceSelectionsToClient);
router.get('/space-selected/:idMongoose', isLoggedIn(), setSpaceAndOrgInJwt);
router.get('/me', handleUserFromRequest, isLoggedIn(), authCtrl.me);

// router.post('/logout', authCtrl.logout);

export default router;
