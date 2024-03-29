import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { generateNonceCode, generateRandomStringByLength, replaceSpecialChars } from '../utils/functions';
import { AuthTokenInterface } from '../types/mongoose-types/model-types/auth-token-interface';

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
    // space: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'spaces',
    //   required: true,
    //   autopopulate: true
    // },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      autopopulate: true
    },
    refEntity: {
      type: String
    },
    refId: {
      type: Schema.Types.ObjectId
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
