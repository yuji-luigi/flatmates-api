import mongoose, { Model, Schema } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

import { formatDateAndTimeForFlights } from '../utils/functions';

import { InvoiceInterface } from '../types/model/invoice-type';
import Maintenance from './Maintenance';
import logger from '../config/logger';

type InvoiceModel = Model<InvoiceInterface, object, object>;
export const invoiceSchema = new Schema<InvoiceInterface, InvoiceModel, unknown>(
  {
    file: {
      type: Schema.Types.ObjectId,
      ref: 'uploads',
      autopopulate: true,
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

invoiceSchema.plugin(autoPopulate);

// sort by most recent
invoiceSchema.pre('find', async function (next) {
  // sort by most recent
  this.sort({ createdAt: -1 });
  next();
});

invoiceSchema.pre('save', async function (next) {
  try {
    const maintenance = await Maintenance.findById(this.maintenance);
    maintenance.invoice = this;
    await maintenance.save();
    next();
  } catch (error) {
    logger.error(error.message || error);
    throw new Error('error in invoiceSchema.pre(save)');
  }
});

invoiceSchema.virtual('_createdAt').get(function () {
  return formatDateAndTimeForFlights(this.createdAt);
});
invoiceSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model<InvoiceInterface, InvoiceModel>('invoices', invoiceSchema);
