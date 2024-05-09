import express from 'express';
import {
  acceptInvitationByLoggedUserAndLinkId,
  acceptInvitationByLogin,
  acceptInvitationByRegistering,
  getInvitationByLinkId
} from '../controllers/InvitationController';
import { queryHandler } from '../../middlewares/handleSetQuery';
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';

const router = express.Router();

router.post('/accept-by-login/:linkId', acceptInvitationByLogin);
router.post('/register/:linkId', acceptInvitationByRegistering);

router.use(handleUserFromRequest);
router.use(queryHandler);

// NOTE: this route is blocking get by invitation._id and it is better to avoid sending all info of the invitation.
router.get('/:linkId', getInvitationByLinkId);
router.get('/accept/:linkId', getInvitationByLinkId);
router.post('/accept/:linkId', acceptInvitationByLoggedUserAndLinkId);

export default router;
