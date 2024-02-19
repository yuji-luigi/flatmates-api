import mongoose, { CallbackWithoutResultAndOptionalError, Document, Model } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { getPrivateUrlOfSpace } from '../api/helpers/uploadFileHelper';
import logger from '../lib/logger';
import { formatDateAndTimev3 } from '../utils/functions';
import { MAINTAINER_TYPES } from '../types/enum/enum';
import { IMaintenance, IMaintenanceMethods, MAINTENANCE_STATUS } from '../types/mongoose-types/model-types/maintenance-interface';
import { ICollectionAware, createSlug } from '../api/helpers/mongoose.helper';

const { Schema } = mongoose;

// import { IMaintenance } from '../types/model/maintenance-type';

// type IMaintenanceDoc = Omit<IMaintenance, '_id'>;
type IMaintenanceDoc = IMaintenance & Document;
interface MaintenanceModel extends Model<IMaintenanceDoc, object, IMaintenanceMethods> {
  // hasSetStorageUrlToModel(): boolean;
  // a: string;
  handleDeleteUploads: (id: string) => Promise<void>;
  setStorageUrlToModel: () => Promise<void>;
  hasSetStorageUrlToModel: true;
}

export const maintenanceSchema = new Schema<IMaintenanceDoc, MaintenanceModel, IMaintenanceMethods>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: '',
      required: true
    },
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: 'uploads',
        autopopulate: true
      }
    ],
    status: {
      type: String,
      enum: Object.values(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.INCOMPLETE
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'uploads',
        autopopulate: true
      }
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'tags'
      }
    ],
    maintainer: {
      type: Schema.Types.ObjectId,
      // ref: 'maintainers',
      autopopulate: true
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    rating: Number,
    type: {
      type: String,
      enum: MAINTAINER_TYPES
    },
    completedAt: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      autopopulate: true,
      immutable: true
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true
    },

    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
      // required: true,
    },
    invoices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'checks'
        // autopopulate: true
      }
    ],
    receipts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'checks'
        // autopopulate: true
      }
    ],
    invoicesTotal: {
      type: Number,
      default: 0
    },
    receiptsTotal: {
      type: Number,
      default: 0
    },
    slug: {
      type: String,
      immutable: true
    },
    cost: {
      type: Number
    }
    // nonce: {
    //   type: Number,
    //   default: generateNonceCode()
    // },
    // linkId: {
    //   type: String,
    //   default: replaceSpecialChars(generateRandomStringByLength(80))
    // }
  },
  {
    versionKey: false,
    timestamps: true,
    methods: {
      /**
       * in the process the image url is set to imageUrl.
       * so never need to call GET storage/key to get the url
       * @returns {Promise<void>}
       */
      setStorageUrlToModel: async function () {
        const { attachments } = this;
        const { images } = this;
        const attachmentUrls: string[] = [];
        const imageUrls: string[] = [];
        for (const singleUpload of attachments) {
          if (singleUpload === null) continue;
          if (singleUpload === undefined) continue;
          const obj = { params: { key: singleUpload.fullPath } };
          const url = await getPrivateUrlOfSpace(obj);
          singleUpload.url = url;
          attachmentUrls.push(url);
        }
        for (const singleUpload of images) {
          if (singleUpload === null) continue;
          if (singleUpload === undefined) continue;
          const obj = { params: { key: singleUpload.fullPath } };
          const url = await getPrivateUrlOfSpace(obj);
          imageUrls.push(url);
          singleUpload.url = url;
        }
        this.attachmentUrls = attachmentUrls;
        this.imageUrls = imageUrls;
      },
      handleDeleteUploads: async function () {
        const { attachments } = this;
        const { images } = this;
        try {
          for (const singleUpload of attachments) {
            if (!singleUpload) continue;
            await singleUpload.deleteFromStorage();
          }
          for (const singleUpload of images) {
            if (!singleUpload) continue;
            await singleUpload.deleteFromStorage();
          }
        } catch (error) {
          logger.error('error in handleDeleteUploads', error.message || error);
          throw error;
        }
      },
      token() {
        throw new Error('token() method is not implemented');
        // const payload = {
        //   _id: this._id
        // };
        // return jwt.sign(payload, vars.jwtSecret, {
        //   expiresIn: '24h' // expires in 24 hours
        // });
      }
    }
  }
);

maintenanceSchema.plugin(autoPopulate);

maintenanceSchema.pre('find', async function (next) {
  // sort by most recent
  this.sort({ createdAt: -1 });
  next();
});

maintenanceSchema.pre('save', async function (this: IMaintenance & ICollectionAware, next: CallbackWithoutResultAndOptionalError) {
  // only when the document is new creates a slug.
  this.slug = await createSlug(this);

  next();
});
// maintenanceSchema.get('_createdAt', function (v) {
//   return v.toISOString();
// });

// maintenanceSchema.virtual('_createdAt').get(function () {
//   return formatDateAndTimev3(this.createdAt);
// });
maintenanceSchema.virtual('_createdAt').get(function () {
  return formatDateAndTimev3(this.createdAt);
});
maintenanceSchema.virtual('entity').get(function () {
  return 'maintenances';
});
maintenanceSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model<IMaintenanceDoc, MaintenanceModel>('maintenances', maintenanceSchema);
