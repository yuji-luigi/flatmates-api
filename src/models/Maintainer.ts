import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

const { Schema } = mongoose;

export const maintainerSchema = new Schema<MaintainerInterface>(
  {
    name: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: 'uploads',
      autopopulate: true
    },
    cover: {
      type: Schema.Types.ObjectId,
      ref: 'uploads',
      autopopulate: true
    },
    homepage: String,
    type: String,
    tel: String,
    email: {
      type: String,
      required: true
    },
    logo: {
      type: Schema.Types.ObjectId,
      ref: 'uploads',
      autopopulate: true
    },
    description: String,
    address: String,
    // organizations: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'organizations'
    //   }
    // ],
    // spaces: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'spaces'
    //   }
    // ],
    isIndividual: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      autopopulate: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

maintainerSchema.statics = {};

maintainerSchema.plugin(autoPopulate);

export default mongoose.model('maintainers', maintainerSchema);
