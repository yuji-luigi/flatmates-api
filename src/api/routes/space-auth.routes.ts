import express from 'express';
// import { checkSSGSecret } from '../../middlewares/auth-middlewares';
// import {
//   // createHeadSpace,

//   sendMainSpacesSlug,
//   sendDataForHomeDashboard
// } from '../controllers/SpaceController';
import { sendRootSpaceSelectionsToClient, setSpaceAndOrgInJwt } from '../controllers/AuthController';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';
import { isLoggedIn } from '../../middlewares/isLoggedIn';

const router = express.Router();
// router.get('/static-props/:slug', checkSSGSecret, sendDataForHomeDashboard);
// router.get('/ssg-paths', checkSSGSecret, sendMainSpacesSlug);

router.use(handleUserFromRequest);
router.get('/space-selections', isLoggedIn(), sendRootSpaceSelectionsToClient);
// ! set space object + organization id as jwt cookie
router.get('/space-selected/:idMongoose', isLoggedIn(), setSpaceAndOrgInJwt);

export default router;
