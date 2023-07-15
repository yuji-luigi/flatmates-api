import { MongooseBaseModel } from './base-types/base-model-interface';
import { MaintainerInterface } from './maintainer-interface';
import { IMaintenance } from './maintenance-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';

export interface InvoiceInterface extends MongooseBaseModel {
  //virtual field name get from maintenance.name
  name: string;
  maintainer: MaintainerInterface;
  maintenance: IMaintenance;
  total: number;
  file: IUpload;
  organization: IOrganization;
  mainSpace: ISpace;
  space?: string | ISpace;
}
