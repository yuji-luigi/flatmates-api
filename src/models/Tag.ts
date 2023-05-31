import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

const { Schema } = mongoose;

export const tagSchema = new Schema<ITag>(
  {
    name: String,
    description: String,
    color: String,
    building: {
      type: Schema.Types.ObjectId,
      ref: 'buildings'
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
