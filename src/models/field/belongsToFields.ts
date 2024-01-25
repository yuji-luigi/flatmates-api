import mongoose from 'mongoose';
const { Schema } = mongoose;
export const belongsToFields = {
  hasAccess: {
    type: Boolean,
    default: false
  },
  rootSpaces: [
    {
      type: Schema.Types.ObjectId,
      ref: 'spaces'
    }
  ],
  organizations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'organizations'
    }
  ]
};
