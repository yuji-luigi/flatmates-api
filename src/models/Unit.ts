import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { UnitInterface } from '../types/mongoose-types/model-types/unit-interface';

const { Schema } = mongoose;

export const unitSchema = new Schema<UnitInterface>(
  {
    name: String,
    surname: String,
    email: String,
    authToken: {
      type: Schema.Types.ObjectId,
      ref: 'authTokens'
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      autopopulate: true
    },
    tailSpace: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

unitSchema.statics = {};

unitSchema.plugin(autoPopulate);

export default mongoose.model('authTokens', unitSchema);
