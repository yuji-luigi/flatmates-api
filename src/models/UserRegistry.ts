import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
const { Schema } = mongoose;

export const userRegistrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'roles',
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true,
    statics: {},
    methods: {}
  }
);

userRegistrySchema.plugin(autoPopulate);
const UserRegistry = mongoose.model('userRegistry', userRegistrySchema);
export default UserRegistry;
