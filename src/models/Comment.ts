import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { IComment } from '../types/mongoose-types/model-types/commen-interface';
const { Schema } = mongoose;

export const commentSchema = new Schema<IComment>(
  {
    body: String,
    private: {
      type: Boolean,
      default: false
    },
    // fund: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'funds'
    // },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      autopopulate: true
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

commentSchema.statics = {};

commentSchema.plugin(autoPopulate);

export default mongoose.model('comments', commentSchema);
