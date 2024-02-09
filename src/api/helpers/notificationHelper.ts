import logger from '../../lib/logger';
import { IMaintenance } from '../../types/mongoose-types/model-types/maintenance-interface';
import { IThread } from '../../types/mongoose-types/model-types/thread-interface';
import { ObjectId } from 'bson';
import Notification from '../../models/Notification';
type NotificationPayload = IMaintenance | IThread;

/**
 * @description create regular notification by users for users
 */
export async function createNotification({
  payload,
  type,
  users = []
}: {
  payload: NotificationPayload;
  type: 'maintenances' | 'threads';
  users?: ObjectId[];
}): Promise<any> {
  try {
    const newNotification = new Notification({
      type,
      title: payload.title,
      image: payload.images[0]?.url,
      isImportant: payload.isImportant,
      space: payload.space,
      organization: payload.organization,
      usersId: users
    });

    return newNotification.save();
  } catch (error) {
    logger.error(error.message || error);
    throw error;
  }
}
