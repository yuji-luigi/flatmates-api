import { authTokenTypes } from './../types/mongoose-types/model-types/auth-token-interface';
import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { generateNonceCode, generateRandomStringByLength, replaceSpecialChars } from '../utils/functions';
import { AuthTokenInterface } from '../types/mongoose-types/model-types/auth-token-interface';
import { generateSecureRandomString } from '../lib/random-generator/generateRandomStrings';
import httpStatus from 'http-status';
import { ErrorCustom } from '../lib/ErrorCustom';

const { Schema } = mongoose;

export const authTokenSchema = new Schema<AuthTokenInterface>(
  {
    linkId: {
      type: String,
      default: () => generateSecureRandomString(80)
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
    validatedAt: {
      type: Date
    },
    type: {
      type: String,
      enum: authTokenTypes,
      required: true
    }
  },
  {
    methods: {
      /**@throws ErrorCustom */
      isNotValidValidatedAt: function () {
        if (this.validatedAt < new Date(Date.now() - 1000 * 60 * 15)) {
          return true;
        }
        return false;
      },
      renew: async function () {
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        this.nonce = generateNonceCode();
        this.linkId = replaceSpecialChars(generateRandomStringByLength(80));
        return this.save();
      }
    },
    versionKey: false,
    timestamps: true
  }
);

authTokenSchema.statics = {};

authTokenSchema.plugin(autoPopulate);

const AuthToken = mongoose.model<AuthTokenInterface>('authTokens', authTokenSchema);
// export type AuthTokenModel = typeof AuthToken;
export default AuthToken;
// TODO: method of this model in interface
export type AuthTokenDocument = AuthTokenInterface & mongoose.Document;
