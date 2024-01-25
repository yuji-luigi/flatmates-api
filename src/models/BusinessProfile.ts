import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { BusinessProfileInterface } from '../types/mongoose-types/model-types/business-profile-interface';

const { Schema } = mongoose;
const { Types } = Schema;
export const BusinessProfileSchema = new Schema<BusinessProfileInterface>(
  {
    name: {
      type: String,
      required: true
    },
    surname: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    avatar: {
      type: Types.ObjectId,
      required: false
    },
    cover: {
      type: Types.ObjectId,
      required: false
    },
    homepage: {
      type: String
    },
    tel: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true
    },
    logo: {
      type: Types.ObjectId,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    address: {
      type: String,
      required: false
    },
    _role: {
      type: String,
      enum: ['maintainer', 'administrator'],
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);
BusinessProfileSchema.statics = {};

BusinessProfileSchema.plugin(autoPopulate);

export default mongoose.model('businessProfiles', BusinessProfileSchema);
