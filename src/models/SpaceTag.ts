import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;
// import jwt from 'jsonwebtoken';

// import vars from '../config/vars';
// import urlSlug from 'mongoose-slug-generator';
import { SpaceTagInterface } from '../types/mongoose-types/model-types/space-tag';

// const { jwtSecret } = vars;

export const spaceTagSchema = new Schema<SpaceTagInterface>(
  {
    name: {
      type: String,
      required: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations'
      // autopopulate: true
    },
    isGlobal: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

// validate isGlobal and organization
spaceTagSchema.pre('save', async function (next) {
  if (this.isGlobal) {
    next();
  }
  if (!this.isGlobal && !this.organization) {
    throw new Error('organization is required');
  }
});

const SpaceTag = model<SpaceTagInterface>('spaceTags', spaceTagSchema);
export default SpaceTag;
