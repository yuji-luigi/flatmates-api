import mongoose from 'mongoose';
import { InvitationInterface, invitationStatuses } from '../types/mongoose-types/model-types/invitation-interface';
import { ErrorCustom } from '../lib/ErrorCustom';
import httpStatus from 'http-status';

const { Schema } = mongoose;

export const invitationSchema = new Schema<InvitationInterface>(
  {
    // data who created invitation
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    cell: String,
    // email of invited user
    email: {
      type: String,
      required: true
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
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

invitationSchema.pre('save', async function (next) {
  const found = await Invitation.findOne({ email: this.email, space: this.space, status: 'pending' });
  if (found && this.isNew) {
    throw new ErrorCustom('Invitation already exists', httpStatus.CONFLICT);
  }
  next();
});

const Invitation = mongoose.model('invitations', invitationSchema);
export default Invitation;
