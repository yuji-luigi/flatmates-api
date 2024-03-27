import Maintenance from '../../models/Maintenance';
import httpStatus from 'http-status';
import logger from '../../lib/logger';
import { Response } from 'express';
import { RequestCustom } from '../../types/custom-express/express-custom';
import Thread from '../../models/Thread';

export async function sendNotificationsToClient(req: RequestCustom, res: Response) {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const dateQuery = {
      createdAt: {
        $gte: oneMonthAgo, // $gte means "greater than or equal to"
        $lte: new Date() // $lte means "less than or equal to"
      }
    };
    const maintenances = await Maintenance.find({ ...req.query, ...dateQuery })
      .sort({ createdAt: -1 })
      .lean();
    const threads = await Thread.find({ ...req.query, ...dateQuery })
      .sort({ createdAt: -1 })
      .lean();
    const combined = [
      ...maintenances.map((maintenance) => ({
        ...maintenance,
        category: 'Maintenance',
        entity: 'maintenances'
      })),
      ...threads.map((thread) => ({
        ...thread,
        category: 'Post',
        entity: 'threads'
      }))
    ].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(httpStatus.CREATED).json({
      success: true,
      collection: 'maintenances',
      data: combined,
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error,
      success: false
    });
  }
}
