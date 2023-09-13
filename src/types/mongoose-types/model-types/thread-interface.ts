import { PostBaseInterface } from './base-types/post-base-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';
import { IUser } from './user-interface';

export interface IThread extends PostBaseInterface {
  // listViewType: 'default' | 'bigImage';
  // articleType: 'default' | 'blog' | 'news' | 'event' | 'announcement' | 'poll' | 'survey' | 'question' | 'discussion';
  description: string;
  attachments: IUpload[] | [];
  rating?: number | undefined;
  createdBy: IUser;
  organization?: IOrganization | string;
  space: ISpace | string;
  createdAt: string;
}

export interface IThreadMethods {
  setStorageUrlToModel: () => Promise<void>;
  /**
   * Deletes thread and all its uploads
   * @returns {Promise<void>}
   */
  handleDeleteUploads: () => Promise<void>;
}
