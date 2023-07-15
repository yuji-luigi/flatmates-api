import { MongooseBaseModel } from './base-types/base-model-interface';
import { InvoiceInterface } from './invoice-interface';
import { MaintainerInterface } from './maintainer-interface';
import { IMaintenance } from './maintenance-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';

export interface ReceiptInterface extends MongooseBaseModel {
  maintainer: MaintainerInterface;
  maintenance: IMaintenance;
  invoice: InvoiceInterface;
  total: number;
  file: IUpload;
  organization: IOrganization;
  mainSpace: ISpace;
}
