import express, { Request, Response } from 'express';

const router = express.Router();
import authCtrl, {
  checkSystemAdmin,
  exitSystemAdmin,
  sendMainOrganizationSelectionsToClient,
  sendRootSpaceSelectionsToClient,
  setSpaceAndOrgInJwt,
  toggleLoggedAsSuperAdmin
} from '../controllers/AuthController';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
import { deleteSpaceCookie } from '../controllers/SpaceController';

export const cache = new Map();

router.get('/', (_req: Request, res: Response) => {
  res.send('auth routes');
});

// ALL ROUTES IS ALLOWED WHEN THE USER IS LOGGED IN
// USER CREATE ROUTE IS ALLOWED ONLY FOR ADMIN

router.post('/login/:role', authCtrl.loginByRole);

router.post('/register', authCtrl.register);
// router.post('/complete-register/maintainer/', authCtrl.completeRegisterMaintainer);

router.get('/logout', authCtrl.logout);

// router.get('/static-props/:slug', checkSSGSecret, sendDataForHomeDashboard);
// router.get('/ssg-paths', checkSSGSecret, sendMainSpacesSlug);

router.use(handleUserFromRequest);
router.get('/space-selections', isLoggedIn(), sendRootSpaceSelectionsToClient);
router.put('/space-selections/:idMongoose', isLoggedIn(), setSpaceAndOrgInJwt);
router.get('/organization-selections', isLoggedIn(), sendMainOrganizationSelectionsToClient);

router.patch('/super-admin/toggle', isLoggedIn(), toggleLoggedAsSuperAdmin);
router.get('/system-admin/check-by-space/:idMongoose', isLoggedIn(), checkSystemAdmin);
router.get('/system-admin/exit', isLoggedIn(), exitSystemAdmin);

// set jwt and send space
router.get('/space-selections/:idMongoose', isLoggedIn(), setSpaceAndOrgInJwt);
router.delete('/space-selections', isLoggedIn(), deleteSpaceCookie);

router.get('/me', isLoggedIn(), authCtrl.me);

export default router;
