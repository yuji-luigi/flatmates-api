import express from 'express';
import { checkSSGSecret } from '../../middlewares/auth-middlewares';
import {
  // createHeadSpace,

  sendMainSpacesSlug,
  sendSpaceDataForHome
} from '../controllers/SpaceController';
import { sendMainSpaceSelectionsToClient, setSpaceAndOrgInJwt } from '../controllers/AuthController';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';
import { isLoggedIn } from '../../middlewares/isLoggedIn';

const router = express.Router();
router.get('/static-props/:slug', checkSSGSecret, sendSpaceDataForHome);
router.get('/ssg-paths', checkSSGSecret, sendMainSpacesSlug);

router.use(handleUserFromRequest);
router.get('/space-selections', isLoggedIn(), sendMainSpaceSelectionsToClient);
// ! set space object + organization id as jwt cookie
router.get('/space-selected/:idMongoose', isLoggedIn(), setSpaceAndOrgInJwt);

export default router;
