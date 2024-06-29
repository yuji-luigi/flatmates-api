import mongoose from 'mongoose';
import { emailVerificationStatuses, VerificationEmailInterface } from '../types/mongoose-types/model-types/verification-email-interface';

const { Schema } = mongoose;

export const VerificationEmailSchema = new Schema<VerificationEmailInterface>(
  {
    // data who created invitation
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    invitation: {
      type: Schema.Types.ObjectId,
      ref: 'invitations'
    },
    authToken: {
      type: Schema.Types.ObjectId,
      ref: 'authTokens',
      required: true
    },
    status: {
      type: String,
      enum: emailVerificationStatuses,
      default: 'pending'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

VerificationEmailSchema.statics = {};

// third argument is collection name. It is not necessary to specify it. It will be created automatically
const VerificationEmail = mongoose.model('verificationEmail', VerificationEmailSchema, 'verificationEmails');
export default VerificationEmail;
