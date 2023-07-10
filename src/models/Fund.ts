import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

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
    building: {
      type: Schema.Types.ObjectId,
      ref: 'buildings'
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

fundSchema.statics = {};

fundSchema.plugin(autoPopulate);

export default mongoose.model('funds', fundSchema);
