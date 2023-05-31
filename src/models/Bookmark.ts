import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
const { Schema } = mongoose;

const bookmarkSchema = new Schema<IBookmark>(
  {
    title: String,
    entity: String,
    /** saving thread or */
    threads: String,
    note: String,
    building: String,
    date: String,
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
