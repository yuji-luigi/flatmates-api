import express from 'express';
import { acceptInvitationByLogin } from '../controllers/InvitationController';

const router = express.Router();

router.post('/accept-by-login/:linkId', acceptInvitationByLogin);
export default router;
