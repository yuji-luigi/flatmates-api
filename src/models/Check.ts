import mongoose, { Model, Schema } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

import { formatDateAndTimev3 } from '../utils/functions';

import { CheckInterface, checkTypes } from '../types/mongoose-types/model-types/check-interface';
import Maintenance from './Maintenance';
import logger from '../config/logger';

type CheckModel = Model<CheckInterface, object, object>;
export const checkSchema = new Schema<CheckInterface, CheckModel, unknown>(
  {
    name: {
      type: String
    },
    total: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number
    },
    files: [
      {
        type: Schema.Types.ObjectId,
        ref: 'uploads',
        autopopulate: true,
        required: true
      }
    ],
    type: {
      type: String,
      enum: checkTypes,
      required: true
    },
    maintainer: {
      type: Schema.Types.ObjectId,
      ref: 'maintainers',
      autopopulate: true
    },
    maintenance: {
      type: Schema.Types.ObjectId,
      ref: 'maintenances'
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      autopopulate: true
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      autopopulate: true
    }
  },
  {
    versionKey: false,
    timestamps: true,
    methods: {}
  }
);

checkSchema.plugin(autoPopulate);

// sort by most recent
checkSchema.pre('find', async function (next) {
  // sort by most recent
  this.sort({ createdAt: -1 });
  next();
});

checkSchema.pre('save', async function (next) {
  try {
    // save in maintenance.invoice or receipt at the creation of the check
    const maintenance = await Maintenance.findById(this.maintenance);
    maintenance[this.type].push(this);
    await maintenance.save();
    next();
  } catch (error) {
    logger.error(error.message || error);
    throw new Error('error in checkSchema.pre(save)');
  }
});

checkSchema.virtual('_createdAt').get(function () {
  return formatDateAndTimev3(this.createdAt);
});
checkSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model<CheckInterface, CheckModel>('checks', checkSchema);
