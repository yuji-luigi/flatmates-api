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
    },
    jobTitle: {
      type: String
    },
    isPublic: {
      type: Boolean,
      default: false
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
userRegistrySchema.pre('save', async function (next) {
  const foundSame = await UserRegistry.findOne({ user: this.user, role: this.role });
  if (foundSame) {
    return;
  }
  next();
});
const UserRegistry = mongoose.model('userRegistry', userRegistrySchema);
export default UserRegistry;
