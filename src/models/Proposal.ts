import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { IProposal } from '../types/mongoose-types/model-types/proposal-interface';
const { Schema } = mongoose;

export const proposalSchema = new Schema<IProposal>(
  {
    amount: Number,
    description: String,
    fundRule: {
      type: Schema.Types.ObjectId,
      ref: 'fundRules'
    },
    mainSpace: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    // proposals: [{
    //   type: Schema.Types.ObjectId,
    //   ref: 'proposals',
    // }],
    isPublic: {
      type: Boolean,
      default: false
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations'
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

proposalSchema.statics = {};

proposalSchema.plugin(autoPopulate);

export default mongoose.model('proposals', proposalSchema);
