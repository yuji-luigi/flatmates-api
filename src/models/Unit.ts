import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { UnitInterface } from '../types/mongoose-types/model-types/unit-interface';

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
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    condominium: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
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
