import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { IOrganization } from '../types/mongoose-types/model-types/organization-interface';

const { Schema } = mongoose;

export const organizationSchema = new Schema<IOrganization>(
  {
    name: String,
    description: String,
    phone: String,
    email: String,
    homepage: String,
    logoBanner: String,
    logoSquare: String,
    maintainers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'maintainers'
      }
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users'
        // autopopulate: true
      }
    ],
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

organizationSchema.statics = {};

organizationSchema.plugin(autoPopulate);

export default mongoose.model('organizations', organizationSchema);
