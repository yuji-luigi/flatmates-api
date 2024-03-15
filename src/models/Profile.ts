import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { IUserSetting } from '../types/mongoose-types/model-types/user-setting-interface';

const { Schema } = mongoose;

export const userSettingSchema = new Schema(
  {
    name: String,
    surname: String,
    
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

export default mongoose.model('profiles', userSettingSchema);
