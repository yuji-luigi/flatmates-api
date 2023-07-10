import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

const { Schema } = mongoose;

export const fundRuleSchema = new Schema<IFundRule>(
  {
    executeCondition: {
      type: String,
      enum: ['every', 'majority']
    },
    building: {
      type: Schema.Types.ObjectId,
      ref: 'buildings'
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
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

fundRuleSchema.statics = {};

fundRuleSchema.plugin(autoPopulate);

export default mongoose.model('fundRules', fundRuleSchema);
