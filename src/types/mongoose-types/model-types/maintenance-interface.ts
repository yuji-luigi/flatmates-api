import { MAINTAINER_TYPES } from '../../enum/enum';
import { CheckInterface } from './check-interface';
import { MaintainerInterface } from './maintainer-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';
import { IUser } from './user-interface';
import { ITag } from './tag-interface';
import { MongooseBaseModel } from './base-types/base-model-interface';

export const MAINTENANCE_STATUS = {
  INCOMPLETE: 'incomplete',
  INVOICED: 'invoiced',
  COMPLETED: 'completed',
  IN_PROGRESS: 'inProgress'
} as const;
export type MAINTENANCE_STATUS_TYPE = (typeof MAINTENANCE_STATUS)[keyof typeof MAINTENANCE_STATUS];

export const MAINTAINER_TYPES_ARRAY = Object.keys(MAINTAINER_TYPES);

export interface IMaintenance extends MongooseBaseModel {
  title: string;
  images: IUpload[] | [];
  description?: string | undefined;
  attachments: IUpload[] | [];
  isImportant: boolean;
  tags: ITag[] | [];
  rating?: number | undefined;
  status: MAINTENANCE_STATUS_TYPE;
  createdBy: IUser;
  type: (typeof MAINTAINER_TYPES)[number];
  organization?: IOrganization | string;
  space: ISpace;
  maintainer: MaintainerInterface;
  /** decides if everyone in the world can see or only under the organization. */
  slug: string;
  invoices?: CheckInterface[];
  receipts?: CheckInterface[];
  cost: number;
  /** nonce to authorize maintainer from email link */
  /** link to href maintainer from email */
  nonce: number;
  linkId: string;
  receiptsTotal: number;
  invoicesTotal: number;
  createdAt: string;
}

export interface IMaintenanceMethods {
  setStorageUrlToModel: () => Promise<void>;
  /**
   * Deletes thread and all its uploads
   * @returns {Promise<void>}
   */
  handleDeleteUploads: () => Promise<void>;
  token: () => string;
}
