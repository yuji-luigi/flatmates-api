import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { RoleInterface } from '../types/mongoose-types/model-types/role-interface';

const { Schema } = mongoose;

export const RoleSchema = new Schema<RoleInterface>(
  {
    name: {
      type: String,
      required: true
      // enum: ['inhabitant', 'maintainer', 'administrator'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);
RoleSchema.statics = {};

RoleSchema.plugin(autoPopulate);
// RoleSchema.pre('save', function () {});
export default mongoose.model('roles', RoleSchema);
