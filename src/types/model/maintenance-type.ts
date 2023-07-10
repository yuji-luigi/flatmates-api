import { MAINTAINER_TYPES } from '../enum/enum';
import { InvoiceInterface } from './invoice-type';
import { ReceiptInterface } from './receipt-type';

export const MAINTENANCE_STATUS = {
  INCOMPLETE: 'incomplete',
  INVOICED: 'invoiced',
  COMPLETED: 'completed',
  IN_PROGRESS: 'inProgress'
} as const;
export type MAINTENANCE_STATUS_TYPE = (typeof MAINTENANCE_STATUS)[keyof typeof MAINTENANCE_STATUS];

export const MAINTAINER_TYPES_ARRAY = Object.keys(MAINTAINER_TYPES);

export interface IMaintenance extends MongooseBaseModel<null, null> {
  name: string;
  createdAt: string;
  title: string;
  images: IUpload[] | [];
  listViewType: 'default' | 'bigImage';
  articleType: 'default' | 'blog' | 'news' | 'event' | 'announcement' | 'poll' | 'survey' | 'question' | 'discussion';
  description?: string | undefined;
  attachments: IUpload[] | [];
  isImportant: boolean;
  tags?: string[];
  rating?: number | undefined;
  status: MAINTENANCE_STATUS_TYPE;
  // createdBy: IUser;
  createdBy: IUser;
  type: (typeof MAINTAINER_TYPES)[number];
  organization?: IOrganization | string;
  mainSpace: ISpace | string;
  slug: string;
  maintainer: MaintainerInterface;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
  invoice?: InvoiceInterface;
  receipt?: ReceiptInterface;
}

export interface IMaintenanceMethods {
  setStorageUrlToModel: () => Promise<void>;
  /**
   * Deletes thread and all its uploads
   * @returns {Promise<void>}
   */
  handleDeleteUploads: () => Promise<void>;
}
