import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { IFundRule } from '../types/mongoose-types/model-types/fundRule-interface';

const { Schema } = mongoose;

export const fundRuleSchema = new Schema<IFundRule>(
  {
    executeCondition: {
      type: String,
      enum: ['every', 'majority']
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    // space: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'spaces'
    // },
    isPublic: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      immutable: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organization'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

fundRuleSchema.statics = {};

fundRuleSchema.plugin(autoPopulate);

export default mongoose.model('fundRules', fundRuleSchema);
