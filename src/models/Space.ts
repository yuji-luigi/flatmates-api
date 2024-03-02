import mongoose, { model, Model } from 'mongoose';
import logger from '../lib/logger';
const { Schema } = mongoose;
// import jwt from 'jsonwebtoken';
import autoPopulate from 'mongoose-autopopulate';

// import vars from '../config/vars';
// import urlSlug from 'mongoose-slug-generator';
import { generateWord, replaceSpecialCharsWith } from '../utils/functions';
import { ISpace, ISpaceMethods, spaceTypes } from '../types/mongoose-types/model-types/space-interface';

// const { jwtSecret } = vars;

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
      default: false
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    password: String,

    isMain: {
      type: Boolean
    },
    isPublic: {
      type: Boolean,
      default: false
    },

    slug: {
      type: String,
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
      // async getHeadSpace() {
      //   try {
      //     if (this.isHead) {
      //       return this;
      //     }
      //     return this.getHeadSpace();
      //   } catch (error) {
      //     logger.error(error.message || error);
      //   }
      // },
      async getMainSpace() {
        try {
          if (this.isMain) {
            return this;
          }
          return this.getMainSpace();
        } catch (error) {
          logger.error('getMainSpace error in space model');
          throw error;
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
        return JSON.stringify(payload);
        // return jwt.sign(payload, jwtSecret, {
        //   expiresIn: '24h' // expires in 24 hours
        // });
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
    if (this.parentId) {
      const parent = await Space.findById(this.parentId);
      if (parent.isTail) {
        throw new Error('parent is tail');
      }
    }

    next();
  } catch (error) {
    logger.error(error.message || error);
    throw new Error('error in slug generation of space');
  }
});

spacesSchema.plugin(autoPopulate);
// spacesSchema.plugin(urlSlug);

const Space = model<ISpace, SpaceModel>('spaces', spacesSchema);
export default Space;
