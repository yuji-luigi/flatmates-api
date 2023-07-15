import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { IBookmark } from '../types/mongoose-types/model-types/bookmar-interface';
const { Schema } = mongoose;

const bookmarkSchema = new Schema<IBookmark>(
  {
    entity: String,
    refId: Schema.Types.ObjectId,
    /** saving thread or */
    note: String,
    mainSpace: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      autopopulate: true
    },

    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      autopopulate: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

bookmarkSchema.plugin(autoPopulate);

// export const Bookmark = mongoose.model('bookmarks', bookmarkSchema);
export default mongoose.model('bookmarks', bookmarkSchema);
