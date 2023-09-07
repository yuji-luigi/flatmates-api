import mongoose, { model, Model } from 'mongoose';
import { getOrganizationOfHead } from '../api/helpers/customHelper';
import logger from '../config/logger';
const { Schema } = mongoose;
import jwt from 'jsonwebtoken';
import autoPopulate from 'mongoose-autopopulate';

import vars from '../config/vars';
// import urlSlug from 'mongoose-slug-generator';
import { generateWord, replaceSpecialCharsWith } from '../utils/functions';
import { ISpace, ISpaceMethods, spaceTypes } from '../types/mongoose-types/model-types/space-interface';

const { jwtSecret } = vars;

export type SpaceModel = Model<ISpace, unknown, ISpaceMethods>;

export const spacesSchema = new Schema<ISpace, SpaceModel, ISpaceMethods>(
  {
    cover: {
      type: Schema.Types.ObjectId,
      ref: 'uploads',
      autopopulate: true
    },

    name: {
      type: String,
      required: true
    },
    maxUsers: {
      type: Number,
      default: 0
    },
    address: String,
    isHead: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: spaceTypes
    },
    isTail: {
      type: Boolean,
      default: true
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    password: String,
    //! TODO: condominium then main is a building. other cases are yet to be defined
    /** actual instance that contains users. ex: (🚫 Italy).  (✅ NttRoma) */
    // todo Delete this
    isMain: {
      type: Boolean
    },

    isPublic: {
      type: Boolean,
      default: false
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users'
        // autopopulate: true
      }
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    // maintainers: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'maintainers'
    //   }
    // ],
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true
      // autopopulate: true
    },

    slug: {
      type: String,
      // slug: 'name',
      unique: true
    }
  },
  {
    statics: {
      getParentModel: (): string => 'spaces'
    },
    methods: {
      /** get parent of this document.(current document) */
      async getParent() {
        return (await mongoose.model('spaces').findById(this.parentId)) as unknown as ISpace;
      },

      /**
       *
       * Get array of id of all of it "current" ancestors use this
       * when necessary to filter the data by ancestor ids avoid making field ancestors instead created this method to be
       * flexible in case of ancestor is modified.
       **/
      async getAncestors(currentDocument = this, ancestors: string[] = []) {
        /** clone the ancestor array to be pure function */
        const clonedAncestor = [...ancestors];
        /** get the parent of the current schema */
        const ancestor = await currentDocument.getParent();
        clonedAncestor.push(ancestor._id.toString());
        /** if parent is present then call the function recursively */
        if (ancestor.parentId) {
          return this.getAncestors(ancestor);
        }
        /** At the end return the array */
        return clonedAncestor;
      },
      async getHeadSpace() {
        try {
          const parent = await this.getParent();
          if (parent.isHead) {
            return parent;
          }
          return parent.getHeadSpace();
        } catch (error) {
          logger.error(error.message || error);
        }
      },
      token() {
        const payload = {
          _id: this._id,
          name: this.name,
          address: this.address,
          organization: this.organization,
          slug: this.slug
        };
        return jwt.sign(payload, jwtSecret, {
          expiresIn: '24h' // expires in 24 hours
        });
      }
    },

    versionKey: false,
    timestamps: true
  }
);

// populate the name of the organization field
// spacesSchema.pre('find', function (next) {
//   // this.populate('organization', 'name');
//   next();
// });
// set slug for pre save
spacesSchema.pre('save', async function (next) {
  try {
    const slug = this.slug || this.name;
    this.slug = replaceSpecialCharsWith(slug, '-').toLocaleLowerCase();
    let slugToCheck = this.slug;

    const found = await Space.findOne({ slug: slugToCheck, _id: { $ne: this._id } });

    let isUnique = !found;
    while (!isUnique) {
      const word = generateWord();
      slugToCheck = `${this.slug}-${word}`;
      const existingSpace = await Space.findOne({ slug: slugToCheck, _id: { $ne: this._id } });
      isUnique = !existingSpace;
      this.slug = slugToCheck;
    }
    // If the slug is not unique, append a unique suffix

    next();
  } catch (error) {
    logger.error(error.message || error);
    throw new Error('error in slug generation of space');
  }
});

spacesSchema.pre('validate', async function (next) {
  if (this.organization) {
    return next();
  }
  if (!this.parentId) {
    this.organization = undefined;
    return next();
  }
  const organization = await getOrganizationOfHead(this.parentId, 'spaces');
  this.organization = organization;
  next();
});
//! REMEMBER: after save the children array is empty
// spacesSchema.pre('save', async function (next) {
//   this.children = [];
//   next();
// });

spacesSchema.plugin(autoPopulate);
// spacesSchema.plugin(urlSlug);

const Space = model<ISpace, SpaceModel>('spaces', spacesSchema);
export default Space;
