import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
const { Schema } = mongoose;

export const proposalSchema = new Schema<IProposal>(
  {
    amount: Number,
    description: String,
    fundRule: {
      type: Schema.Types.ObjectId,
      ref: 'fundRules'
    },
    building: {
      type: Schema.Types.ObjectId,
      ref: 'buildings'
    },
    // proposals: [{
    //   type: Schema.Types.ObjectId,
    //   ref: 'proposals',
    // }],
    isPublic: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users'
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
