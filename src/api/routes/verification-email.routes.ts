import express from 'express';
import { verifyEmailByLinkId } from '../controllers/VerificationEmailController';

const router = express.Router();

export const cache = new Map();

router.post('/verify/:linkId', verifyEmailByLinkId);

export default router;
