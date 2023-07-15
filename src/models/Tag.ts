import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { ITag } from '../types/mongoose-types/model-types/tag-interface';

const { Schema } = mongoose;

export const tagSchema = new Schema<ITag>(
  {
    name: String,
    description: String,
    color: String,
    mainSpace: {
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

tagSchema.statics = {};

tagSchema.plugin(autoPopulate);

export default mongoose.model('tags', tagSchema);
