import { IMaintenance } from './maintenance-type';

export interface InvoiceInterface extends MongooseBaseModel<null, null> {
  maintainer: MaintainerInterface;
  maintenance: IMaintenance;
  total: number;
  file: IUpload;
  organization: IOrganization;
  mainSpace: ISpace;
}
