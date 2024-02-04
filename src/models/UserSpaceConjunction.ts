import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { AuthTokenInterface } from '../types/mongoose-types/model-types/auth-token-interface';
import { ObjectId } from 'bson';
import { UserSpaceConjunction } from '../types/mongoose-types/model-types/user-space-conjunction-interface';

const { Schema } = mongoose;

export const userSpaceConjunctionSchema = new Schema<UserSpaceConjunction>(
  {
    user: {
      type: ObjectId,
      ref: 'users',
      required: true
    },
    space: {
      type: ObjectId,
      ref: 'spaces',
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

userSpaceConjunctionSchema.statics = {};

userSpaceConjunctionSchema.plugin(autoPopulate);

export default mongoose.model<UserSpaceConjunction>('userSpaceConjunctions', userSpaceConjunctionSchema);
