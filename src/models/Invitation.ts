import mongoose from 'mongoose';
import { InvitationInterface, invitationStatuses } from '../types/mongoose-types/model-types/invitation-interface';
import { ErrorCustom } from '../lib/ErrorCustom';
import httpStatus from 'http-status';
import { UnitInterface } from '../types/mongoose-types/model-types/unit-interface';
import { IUser, UserBase } from '../types/mongoose-types/model-types/user-interface';
import { ObjectId } from 'bson';
import { ReqUser } from '../lib/jwt/jwtTypings';

const { Schema } = mongoose;

export const invitationSchema = new Schema<InvitationInterface, any, any, any, any, InvitaionStatics>(
  {
    // data who created invitation
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    // NOTE: now priority to tenant and owner. but eventually set only owner. ask property manager in real world
    displayName: {
      type: String
    },
    cell: String,
    // email of invited user
    email: {
      type: String
      // required: true
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      required: true
    },
    userType: {
      type: String,
      required: true
    },
    type: {
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
      ref: 'authTokens',
      required: true
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: 'units'
    },
    acceptedAt: {
      type: Date
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const invitationStatics = {
  createForUnit: async function ({
    unit,
    space,
    createdBy,
    authToken
  }: {
    unit: UnitInterface;
    space: ObjectId;
    createdBy: ObjectId;
    authToken: ObjectId;
  }) {
    await this.create({
      userType: 'inhabitant',
      status: 'pending',
      unit: unit._id,
      space: space,
      type: 'qrcode',
      createdBy,
      authToken,
      displayName: unit.tenantName || unit.ownerName
    });
  }
};
type InvitaionStatics = typeof invitationStatics;
invitationSchema.statics = invitationStatics;

invitationSchema.pre('save', async function (next) {
  const found = await Invitation.findOne({
    $or: [
      // NOTE: case for property_manager and maintainer
      {
        $and: [
          {
            email: { $exists: true }
          },
          { email: this.email }
        ],
        space: this.space,
        status: 'pending'
      },

      // NOTE: case for flatmates unit
      // if the same unit and the same type of invitation is pending, then throw error
      {
        $and: [
          {
            unit: { $exists: true }
          },
          {
            unit: this.unit
          }
        ],
        status: 'pending',
        userType: this.userType
      }
    ]
  });

  if (this.userType === 'inhabitant' && !this.unit) {
    throw new ErrorCustom('Unit is required to create flatmates(Units).', httpStatus.BAD_REQUEST);
  }

  if (found && this.isNew) {
    throw new ErrorCustom('Invitation already exists', httpStatus.CONFLICT);
  }

  if ((this.userType === 'property_manager' || this.userType === 'maintainer') && !this.email) {
    throw new ErrorCustom('Email is for inviting.', httpStatus.BAD_REQUEST, `${this.userType} must have email.`);
  }
  if (this.userType === 'inhabitant' && !this.unit) {
    throw new ErrorCustom('Unit is required to create flatmates(Units).', httpStatus.BAD_REQUEST, 'Unit is required for inhabitant.');
  }
  next();
});

const Invitation = mongoose.model('invitations', invitationSchema);
export default Invitation;
