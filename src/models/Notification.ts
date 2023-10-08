import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { INotification } from '../types/mongoose-types/model-types/notification-interface';
const { Schema } = mongoose;

export const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, default: 'Untitled' },
    body: {
      type: String,
      required: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      autopopulate: true
    },
    seen: []
  },
  {
    versionKey: false,
    timestamps: true
  }
);

notificationSchema.plugin(autoPopulate);

export default mongoose.model('notifications', notificationSchema);
