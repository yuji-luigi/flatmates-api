import express from 'express';

const router = express.Router();
import { handleUserFromRequest } from '../../middlewares/handleUserFromRequest';
import { queryHandler } from '../../middlewares/handleSetQuery';
import { sendStatisticsByMonthToClient } from '../controllers/StatisticController';

router.use(handleUserFromRequest);
router.use(queryHandler);

router.get('/by-month', sendStatisticsByMonthToClient);

export default router;
