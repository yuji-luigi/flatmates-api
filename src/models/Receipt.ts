import mongoose, { Model, Schema } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

import { formatDateAndTimeForFlights } from '../utils/functions';
import { ReceiptInterface } from '../types/model/receipt-type';
import Maintenance from './Maintenance';
import logger from '../config/logger';

type ReceiptModel = Model<ReceiptInterface, object, object>;
export const ReceiptSchema = new Schema<ReceiptInterface, ReceiptModel, unknown>(
  {
    file: {
      type: Schema.Types.ObjectId,
      ref: 'uploads',
      autopopulate: true,
      required: true
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'invoices',
      autopopulate: true
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
    mainSpace: {
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

ReceiptSchema.plugin(autoPopulate);

// sort by most recent
ReceiptSchema.pre('find', async function (next) {
  // sort by most recent
  this.sort({ createdAt: -1 });
  next();
});

ReceiptSchema.pre('save', async function (next) {
  try {
    if (!this.maintenance) {
      throw new Error('maintenance is undefined. you must provide maintenance in order to save receipt');
    }
    const maintenance = await Maintenance.findById(this.maintenance);
    maintenance.invoice = this;
    await maintenance.save();
    next();
  } catch (error) {
    logger.error(error.message || error);
    throw new Error('error in invoiceSchema.pre(save)');
  }
});

ReceiptSchema.virtual('_createdAt').get(function () {
  return formatDateAndTimeForFlights(this.createdAt);
});
ReceiptSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model<ReceiptInterface, ReceiptModel>('receipts', ReceiptSchema);
