import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { UnitInterface, unitStatus } from '../types/mongoose-types/model-types/unit-interface';

const { Schema } = mongoose;

export const unitSchema = new Schema<UnitInterface>(
  {
    name: {
      type: String,
      required: true
    },
    ownerName: {
      type: String,
      required: true
    },
    tenantName: {
      type: String
      // required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    /** the tip space. */
    unitSpace: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      required: true
    },
    /** scala in italian */
    wing: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      required: true
    },
    /** piano in italian */
    floor: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      required: true
    },
    /** the condominium */
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      required: true
    },
    status: {
      type: String,
      enum: unitStatus,
      default: 'idle',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

unitSchema.statics = {};

unitSchema.plugin(autoPopulate);

export default mongoose.model('units', unitSchema);
