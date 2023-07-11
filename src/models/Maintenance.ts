import mongoose, { CallbackWithoutResultAndOptionalError, Model } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { getPrivateUrlOfSpace } from '../api/helpers/uploadFileHelper';
import logger from '../config/logger';
import { formatDateAndTimeForFlights, generateNonceCode, generateRandomStringByLength } from '../utils/functions';
import { MAINTAINER_TYPES } from '../types/enum/enum';
import { IMaintenance, IMaintenanceMethods, MAINTENANCE_STATUS } from '../types/model/maintenance-type';
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
    articleType: {
      type: String,
      default: 'default'
    },
    listViewType: {
      type: String,
      default: 'default'
    },
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
      ref: 'maintainers',
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      autopopulate: true,
      immutable: true
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true
    },
    mainSpace: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
      // required: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'invoices',
      autopopulate: true
    },
    receipt: {
      type: Schema.Types.ObjectId,
      ref: 'receipts',
      autopopulate: true
    },
    slug: {
      type: String,
      immutable: true
    },
    nonce: {
      type: Number,
      default: generateNonceCode()
    },
    linkId: {
      type: String,
      default: generateRandomStringByLength(80)
    }
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

maintenanceSchema.virtual('_createdAt').get(function () {
  return formatDateAndTimeForFlights(this.createdAt);
});
maintenanceSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model<IMaintenanceDoc, MaintenanceModel>('maintenances', maintenanceSchema);
