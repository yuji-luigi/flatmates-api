import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { IFund } from '../types/mongoose-types/model-types/fund-interface';

const { Schema } = mongoose;

export const fundSchema = new Schema<IFund>(
  {
    amount: Number,
    fundRules: [
      {
        type: Schema.Types.ObjectId,
        ref: 'fundRules'
      }
    ],
    isPublic: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      immutable: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

fundSchema.statics = {};

fundSchema.plugin(autoPopulate);

export default mongoose.model('funds', fundSchema);
