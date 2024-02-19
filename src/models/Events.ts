import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import { IEvent } from '../types/mongoose-types/model-types/event-interface';
const { Schema } = mongoose;

const publishStatus = ['draft', 'published', 'deleted'];

const Events = new Schema<IEvent>(
  {
    title: String,
    subtitle: String,
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    body: String,
    private: Boolean,
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations'
    },
    fromDate: Date,
    toDate: Date,
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'tags'
      }
    ],
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    ],
    status: {
      type: String,
      enum: publishStatus
    },
    isPublic: Boolean,
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'uploads',
        autopopulate: true
      }
    ],
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: 'uploads',
        autopopulate: true
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      immutable: true
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
