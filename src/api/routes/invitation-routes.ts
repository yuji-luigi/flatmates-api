import express from 'express';
import {
  acceptInvitationByLoggedUserAndLinkId,
  acceptInvitationByLogin,
  acceptInvitationByRegistering,
  declineInvitationByLinkId,
  getInvitationByLinkIdAndSendToClient,
  inviteToSpaceByUserTypeEmail,
  sentAuthTokenOfUnitFromInvitation
} from '../controllers/InvitationController';
import { queryHandler } from '../../middlewares/handleSetQuery';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';

const router = express.Router();

router.get('/by-linkId/:linkId', getInvitationByLinkIdAndSendToClient);

router.get('/units/auth-token/:idMongoose', sentAuthTokenOfUnitFromInvitation);

router.post('/accept-by-login/:linkId', acceptInvitationByLogin);
router.post('/decline/:linkId', declineInvitationByLinkId);
router.post('/register/:linkId', acceptInvitationByRegistering);

router.use(handleUserFromRequest);
router.use(queryHandler);

router.post('/:userType', inviteToSpaceByUserTypeEmail);
router.put('/:idMongoose', (_req, res) => {
  res.send('Edit invitation route. To be implemented');
});

// NOTE: this route is blocking get by invitation._id and it is better to avoid sending all info of the invitation.
router.get('/accept/:linkId', (_req, res) => {
  console.error('This route is unknown route...: /accept/:linkId');
  res.status(404).json({ message: 'Unknown route' });
});
router.post('/accept/:linkId', acceptInvitationByLoggedUserAndLinkId);

export default router;
