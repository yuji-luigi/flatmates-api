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
  maintainer: MaintainerInterface;
  maintenance: IMaintenance;
  total: number;
  subtotal: number;
  files: IUpload[];
  organization: IOrganization;
  // mainSpace: ISpace;
  type: CheckType;
  /** @description mainSpace. if necessary tailSpace will be tailSpace */
  space: ISpace;
}
