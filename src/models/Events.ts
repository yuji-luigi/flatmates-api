import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
const { Schema } = mongoose;

const publishStatus = ['draft', 'published', 'deleted'];

const Events = new Schema<IEvent>(
  {
    title: String,
    subtitle: String,
    building: String,
    fromDate: Date,
    toDate: Date,
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'tags'
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      immutable: true
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    ],
    status: {
      type: String,
      enum: publishStatus
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

Events.plugin(autoPopulate);

export const Bookmark = mongoose.model('events', Events);
export default Events;
