import { authTokenTypes } from './../types/mongoose-types/model-types/auth-token-interface';
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
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    },

    type: {
      type: String,
      enum: authTokenTypes,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

authTokenSchema.statics = {};

authTokenSchema.plugin(autoPopulate);

const AuthToken = mongoose.model<AuthTokenInterface>('authTokens', authTokenSchema);
// export type AuthTokenModel = typeof AuthToken;
export default AuthToken;

export type AuthTokenDocument = AuthTokenInterface & mongoose.Document;
