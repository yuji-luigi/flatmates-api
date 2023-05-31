import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

const { Schema } = mongoose;

export const userSettingSchema = new Schema<IUserSetting>(
  {
    pushNotification: Boolean,
    smsNotification: Boolean,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  },
  {
    timestamps: true
  }
);

userSettingSchema.statics = {};

userSettingSchema.plugin(autoPopulate);

export default mongoose.model('userSettings', userSettingSchema);
