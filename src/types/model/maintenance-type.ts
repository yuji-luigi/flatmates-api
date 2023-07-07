import { MAINTAINER_TYPES } from '../enum/enum';

export const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  IN_PROGRESS: 'inProgress'
};

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
  status: keyof typeof MAINTENANCE_STATUS;
  // createdBy: IUser;
  user: IUser;
  type: (typeof MAINTAINER_TYPES)[number];
  organization?: IOrganization | string;
  space: ISpace | string;
  slug: string;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
}

export interface IMaintenanceMethods {
  setStorageUrlToModel: () => Promise<void>;
  /**
   * Deletes thread and all its uploads
   * @returns {Promise<void>}
   */
  handleDeleteUploads: () => Promise<void>;
}
