import mongoose, { Model } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { deleteFileFromStorage, getPrivateUrlOfSpace } from '../api/helpers/uploadFileHelper';
import logger from '../config/logger';
import vars from '../config/vars';
// import { deleteFileFromStorage } from '../api/helpers/uploadFileHelper';
const { Schema } = mongoose;
type IUploadModel = Model<IUpload, object, IUploadMethods>;

export const ACL_STATUS = {
  PRIVATE: 'private',
  PUBLIC_READ: 'public-read'
} as const;

const uploadSchema = new Schema<IUpload, IUploadModel, IUploadMethods>(
  {
    /** name of the file with extension */
    fileName: {
      type: String,
      required: true
    },
    /** name of the file without gui date as suffix */
    originalFileName: {
      type: String
    },
    extension: {
      type: String,
      required: true
    },
    mimetype: {
      type: String
      // required: true
    },
    ACL: {
      type: String,
      enum: Object.values(ACL_STATUS),
      default: ACL_STATUS.PUBLIC_READ
    },
    /** now is set to be entity. */
    folder: {
      type: String,
      required: true
    },
    /** field of the parent model where this upload lives */
    fieldInParent: {
      type: String,
      default: 'no_field',
      required: true
    },

    /** folder/fileName */
    fullPath: {
      type: String,
      required: true
    },
    size: {
      type: Number
      // required: true,
    },
    url: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      autopopulate: true
    }
  },
  {
    versionKey: false,
    timestamps: true,
    statics: {},
    methods: {
      methods() {
        console.log('methods');
      },
      async removeThis() {
        const thisData: IUpload = await mongoose.model('uploads').findByIdAndDelete(this._id);
        return thisData;
      },
      async setUrl() {
        if (this.ACL === ACL_STATUS.PUBLIC_READ) {
          this.url = vars.storageUrl + '/' + this.fullPath;
          return;
        }
        const obj = { params: { key: this.fullPath } };
        const url = await getPrivateUrlOfSpace(obj);
        this.url = url;
      },

      async deleteFromStorage() {
        const resultS3 = await deleteFileFromStorage(this.fullPath);
        logger.info(`deleteFromStorage resultS3 ${JSON.stringify(resultS3, null, 2)}`);
        const result = await this.removeThis();
        logger.info(`delete upload model ${JSON.stringify(result, null, 2)}`);
      }
    }
  }
);

uploadSchema.plugin(autoPopulate);

export default mongoose.model('uploads', uploadSchema);
uploadSchema.virtual('name').get(function () {
  return this.fileName;
});

// https://mongoosejs.com/docs/2.7.x/docs/virtuals.html
uploadSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model<IUpload, IUploadModel>('uploads', uploadSchema);
