import { InvoiceInterface } from './invoice-type';
import { IMaintenance } from './maintenance-type';

export interface ReceiptInterface extends MongooseBaseModel<null, null> {
  maintainer: MaintainerInterface;
  maintenance: IMaintenance;
  invoice: InvoiceInterface;
  total: number;
  file: IUpload;
  organization: IOrganization;
  mainSpace: ISpace;
}
