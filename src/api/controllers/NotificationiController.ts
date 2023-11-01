import Maintenance from '../../models/Maintenance';
import httpStatus from 'http-status';
import logger from '../../config/logger';
import { Response } from 'express';
import { deleteEmptyFields } from '../../utils/functions';
import Upload from '../../models/Upload';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { sendEmail } from '../helpers/nodemailerHelper';
import { createOptionsForMaintenance } from '../helpers/maintenanceHelper';
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
/**
 * POST CONTROLLERS
 */

// const createNotification = async (req: RequestCustom, res: Response) => {
//   try {
//     const reqBody = deleteEmptyFields(req.body);
//     reqBody.createdBy = req.user;
//     reqBody.organization = req.query.organization;
//     reqBody.space = req.query.space;

//     const maintenance = new Maintenance(reqBody);

//     const images = await Upload.find({ _id: { $in: maintenance.images } });
//     maintenance.images = images;

//     //!todo send email to the maintainers of the space of type of maintenance
//     //!todo log the email
//     const mailOptions = await createOptionsForMaintenance({ maintenance });
//     if (mailOptions) {
//       await sendEmail(mailOptions);
//     }
//     await maintenance.save();

//     const maintenances = await Maintenance.find(req.query).sort({ createdAt: -1 });
//     for (const maintenance of maintenances) {
//       for (const image of maintenance.images) {
//         await image.setUrl();
//       }
//     }

//     res.status(httpStatus.CREATED).json({
//       success: true,
//       collection: 'maintenances',
//       data: maintenances,
//       count: 1
//     });
//   } catch (error) {
//     logger.error(error.message || error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       message: error.message || error,
//       success: false
//     });
//   }
// };
// export const notificationController = {
//   createNotification
// };
// export default notificationController;
