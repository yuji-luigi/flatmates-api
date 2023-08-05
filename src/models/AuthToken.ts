import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { AuthTokenInterface } from '../types/mongoose-types/model-types/auth-token-interface';
import { generateNonceCode, generateRandomStringByLength, replaceSpecialChars } from '../utils/functions';

const { Schema } = mongoose;

export const authTokenSchema = new Schema<AuthTokenInterface>(
  {
    linkId: {
      type: String,
      default: replaceSpecialChars(generateRandomStringByLength(80))
    },
    nonce: {
      type: Number,
      default: generateNonceCode()
    },
    used: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

authTokenSchema.statics = {};

authTokenSchema.plugin(autoPopulate);

export default mongoose.model('authTokens', authTokenSchema);
