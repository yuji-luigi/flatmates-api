import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import bcrypt from 'bcrypt';
import Space from './Space';
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
    password: {
      type: String
    },
    spaces: [
      {
        type: Schema.Types.ObjectId,
        ref: 'spaces',
        autopopulate: true
      }
    ],
    description: String,
    address: String,
    isInSpace: Boolean,
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
maintainerSchema.pre('save', async function save(next) {
  try {
    if (this.isModified('password')) {
      const rounds = 10;
      const hash = await bcrypt.hash(this.password, rounds);
      this.password = hash;
    }
    if (this.isModified('spaces')) {
      console.log('spaces are modified: Maintainer.ts');
      const stringifiedSpaces = this.spaces.map((space) => space.toString());
      const setSpaces = [...new Set(stringifiedSpaces)];
      const spaces = await Space.find({ _id: { $in: setSpaces } }).lean();
      this.spaces = spaces;
    }
    return next();
  } catch (error) {
    return next(error);
  }
});
maintainerSchema.statics = {};

maintainerSchema.plugin(autoPopulate);

// maintainerSchema.pre('findOne', function (next) {
//   this.populate('avatar');
//   this.populate('cover');
//   this.populate('logo');
//   this.populate('spaces');
//   this.populate('createdBy');
//   next();
// });

export default mongoose.model('maintainers', maintainerSchema);
