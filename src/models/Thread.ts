import mongoose, { Model } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { getPrivateUrlOfSpace } from '../api/helpers/uploadFileHelper';
import logger from '../lib/logger';
import { formatDateAndTimev3 } from '../utils/functions';
import { IThread, IThreadMethods } from '../types/mongoose-types/model-types/thread-interface';

const { Schema } = mongoose;

interface ThreadModel extends Model<IThread, object, IThreadMethods> {
  // hasSetStorageUrlToModel(): boolean;
  // a: string;
  handleDeleteUploads: (id: string) => Promise<void>;
  setStorageUrlToModel: () => Promise<void>;
  hasSetStorageUrlToModel: true;
}

export const threadSchema = new Schema<IThread, ThreadModel, IThreadMethods>(
  {
    title: String,
    description: String,
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: 'uploads',
        autopopulate: true
      }
    ],

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
    rating: Number,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      autopopulate: true
    },

    isPublic: {
      type: Boolean,
      default: false
    },
    isImportant: Boolean,
    spaces: [
      {
        type: Schema.Types.ObjectId,
        ref: 'spaces'
        // required: true
      }
    ]
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

threadSchema.plugin(autoPopulate);

threadSchema.pre('find', async function (next) {
  // sort by most recent
  this.sort({ createdAt: -1 });
  next();
});
// threadSchema.get('_createdAt', function (v) {
//   return v.toISOString();
// });
threadSchema.virtual('_createdAt').get(function () {
  return formatDateAndTimev3(this.createdAt);
});
threadSchema.virtual('entity').get(function () {
  return 'threads';
});
threadSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model<IThread, ThreadModel>('threads', threadSchema);
