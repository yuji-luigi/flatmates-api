import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { AuthTokenInterface } from '../types/mongoose-types/model-types/auth-token-interface';
import { generateNonceCode, generateRandomStringByLength, replaceSpecialChars } from '../utils/functions';
import { loginInstanceEntities } from '../types/mongoose-types/model-types/Entities';
import { ObjectId } from 'bson';

const { Schema } = mongoose;

export const authTokenSchema = new Schema<AuthTokenInterface>(
  {
    linkId: {
      type: String,
      default: () => replaceSpecialChars(generateRandomStringByLength(80))
    },
    nonce: {
      type: Number,
      default: () => generateNonceCode()
    },
    active: {
      type: Boolean,
      default: true
    },
    space: {
      type: ObjectId,
      ref: 'spaces',
      required: true
    },
    docHolder: {
      ref: {
        type: String,
        enum: loginInstanceEntities
      },
      instanceId: Schema.Types.ObjectId
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

authTokenSchema.statics = {};

authTokenSchema.plugin(autoPopulate);

export default mongoose.model<AuthTokenInterface>('authTokens', authTokenSchema);
