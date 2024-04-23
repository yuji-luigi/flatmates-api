import express from 'express';
import { sendSingleMaintainerBySlug } from '../controllers/MaintainerController';
import { isLoggedIn } from '../../middlewares/isLoggedIn';
import { RequestCustom } from '../../types/custom-express/express-custom';
import {
  addSpacesToUserByUserType,
  addUserByUserTypeToSpace,
  createUserByUserType,
  favoriteUserByUserTypeToSpaceAndSendToClient,
  removeSpaceFromUserByUserTypeById,
  removeUserByUserTypeFromSpaceAndSendToClient,
  sendUserByUserTypesOfBuildingToClient,
  sendUserByUserTypesToClient,
  sendUserByUserTypesWithPaginationToClient,
  updateUserByUserTypeById
} from '../controllers/UserByController';
const router = express.Router();

const userTypes = ['property_managers', 'inhabitants', 'system_admins', 'maintainers'];

router.use('/:userType', (req: RequestCustom, res, next) => {
  console.log(req.params.userType);
  if (userTypes.includes(req.params.userType)) {
    next();
    return;
  }
  next('router');
});

router.get('/test/test', (req, res) => res.send('API is working: userByUserType.routes.ts'));

router.get('/:userType', isLoggedIn(), sendUserByUserTypesToClient);
router.get('/:userType/with-pagination', isLoggedIn(), sendUserByUserTypesWithPaginationToClient);
router.get('/:userType/slug/:slug', isLoggedIn(), sendSingleMaintainerBySlug);

router.post('/:userType/with-pagination', isLoggedIn(), createUserByUserType);
router.post('/:userType/:idMaintainer/space/:idSpace', isLoggedIn(), addUserByUserTypeToSpace);
router.put('/:userType/:idMongoose', isLoggedIn(), updateUserByUserTypeById);
router.post('/:userType/:idMongoose/spaces', isLoggedIn(), addSpacesToUserByUserType);
router.delete('/:userType/:idMongoose/space', isLoggedIn(), removeUserByUserTypeFromSpaceAndSendToClient);
router.post('/:userType/:idMongoose/space', isLoggedIn(), favoriteUserByUserTypeToSpaceAndSendToClient);

router.get('/:userType/spaces', isLoggedIn(), sendUserByUserTypesOfBuildingToClient);
router.delete('/:userType/spaces', isLoggedIn(), removeSpaceFromUserByUserTypeById);

export default router;
