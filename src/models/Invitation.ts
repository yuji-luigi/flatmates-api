import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { InvitationInterface, invitationStatuses } from '../types/mongoose-types/model-types/invitation-interface';

const { Schema } = mongoose;

export const invitationSchema = new Schema<InvitationInterface>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      autopopulate: true
    },
    cell: String,
    email: {
      type: String,
      required: true
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      autopopulate: true
    },
    userType: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: invitationStatuses,
      default: 'pending'
    },
    authToken: {
      type: Schema.Types.ObjectId,
      ref: 'authTokens'
    }
  },

  {
    versionKey: false,
    timestamps: true
  }
);

invitationSchema.statics = {};

invitationSchema.plugin(autoPopulate);

export default mongoose.model('invitations', invitationSchema);
