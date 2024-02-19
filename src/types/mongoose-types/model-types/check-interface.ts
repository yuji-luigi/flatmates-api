import { Document } from 'mongoose';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { MaintainerInterface } from './maintainer-interface';
import { IMaintenance } from './maintenance-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';

export const checkTypes = ['invoices', 'receipts'] as const;
export type CheckType = (typeof checkTypes)[number];
export interface CheckInterface extends MongooseBaseModel {
  //virtual field name get from maintenance.name
  name: string;
  // deprecate this
  maintainer: MaintainerInterface;
  // deprecate this
  maintenance: IMaintenance;
  // new fields
  of: {
    entity: string;
    ofId: string;
  };
  uploadedBy: {
    entity: string;
    uploaderId: string;
  };
  total: number;
  subtotal: number;
  files: IUpload[];
  organization: string | IOrganization;
  // space: ISpace;
  type: CheckType;
  entity: string;
  /** @description space. if necessary tailSpace will be tailSpace */
  space: ISpace;
  _modifiedMaintenance?: IMaintenance & Document;
}
