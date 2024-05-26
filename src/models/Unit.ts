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
    mateName: {
      type: String,
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    mate: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    /** the tip space. */
    unitSpace: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    /** the condominium */
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    status: {
      type: String,
      enum: unitStatus,
      default: 'idle',
      required: true
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
