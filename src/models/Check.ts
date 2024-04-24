import mongoose, { Model, Schema } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

import { formatDateAndTimev3 } from '../utils/functions';

import { CheckInterface, checkTypes } from '../types/mongoose-types/model-types/check-interface';
import logger from '../lib/logger';

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
    // type: {
    //   type: String,
    //   enum: checkTypes,
    //   required: true
    // },
    entity: {
      type: String,
      required: true
    },
    parent: {
      entity: String,
      _id: Schema.Types.ObjectId
    },
    uploadedBy: {
      entity: String,
      uploaderId: Schema.Types.ObjectId
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      required: true
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

// checkSchema.pre('validate', async function (next) {
//   try {
//     // save in maintenance.invoice or receipt at the creation of the check
//     // const maintenance = await Maintenance.findById(this.maintenance);
//     // if (maintenance) {
//     //   this.space = maintenance.space;
//     //   this.organization = maintenance.organization;
//     //   // maintenance[this.type].push(this);
//     //   // if (this.type === 'invoices') {
//     //   //   maintenance.invoicesTotal += this.total;
//     //   // }
//     //   // if (this.type === 'receipts') {
//     //   //   maintenance.receiptsTotal += this.total;
//     //   // }
//     //   this.name = maintenance.title;
//     //   this._modifiedMaintenance = maintenance;
//     }
//     // next();
//   } catch (error) {
//     logger.error(error.message || error);
//     throw new Error('error in checkSchema.pre(save)');
//   }
// });

// Post-validate hook
checkSchema.post('validate', async function (doc, next) {
  try {
    // Check if _modifiedMaintenance exists and then save it
    if (doc._modifiedMaintenance) {
      await doc._modifiedMaintenance.save();
    }
    next();
  } catch (error) {
    logger.error(error.message || error);
    throw new Error('error in checkSchema.post(validate)');
  }
});

checkSchema.virtual('_createdAt').get(function () {
  return formatDateAndTimev3(this.createdAt);
});
checkSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model<CheckInterface, CheckModel>('checks', checkSchema);
