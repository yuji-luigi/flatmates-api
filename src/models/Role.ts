import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { RoleInterface, isRoleField } from '../types/mongoose-types/model-types/role-interface';

const { Schema } = mongoose;

export const roleSchema = new Schema<RoleInterface>(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    label: {
      type: String
      // required: true,
      // unique: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);
roleSchema.statics = {};

roleSchema.plugin(autoPopulate);
roleSchema.pre('save', function () {
  if (this.name) {
    if (!isRoleField(this.name)) {
      throw new Error('invalid Role name');
    }
  } else {
    throw new Error('Role name is required');
  }
});

export default mongoose.model('roles', roleSchema);
