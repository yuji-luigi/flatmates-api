import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { RoleInterface } from '../types/mongoose-types/model-types/role-interface';
import { belongsToFields } from './field/belongsToFields';

const { Schema } = mongoose;

export const RoleSchema = new Schema<RoleInterface>(
  {
    administrator: {
      ...belongsToFields,
      profile: {
        type: Schema.Types.ObjectId,
        ref: 'businessProfiles'
      }
    },
    maintainer: {
      ...belongsToFields,
      profile: {
        type: Schema.Types.ObjectId,
        ref: 'businessProfiles'
      }
    },
    inhabitant: belongsToFields,
    isSuperAdmin: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);
RoleSchema.statics = {};

RoleSchema.plugin(autoPopulate);
const fields = ['maintainer', 'administrator', 'inhabitant'] as const;
RoleSchema.pre('save', function () {
  for (const key of fields) {
    const { rootSpaces, organizations } = this[key];
    if (rootSpaces.length || organizations.length) {
      this[key].hasAccess = true;
    } else {
      this[key].hasAccess = false;
    }
  }
});

export default mongoose.model('roles', RoleSchema);
