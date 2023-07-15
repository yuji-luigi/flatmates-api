import { MongooseBaseModel } from './base-model-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';
import { IUser } from './user-interface';

export interface IThread extends MongooseBaseModel {
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
  // createdBy: IUser;
  user: IUser;
  organization?: IOrganization | string;
  space: ISpace | string;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
}

export interface IThreadMethods {
  setStorageUrlToModel: () => Promise<void>;
  /**
   * Deletes thread and all its uploads
   * @returns {Promise<void>}
   */
  handleDeleteUploads: () => Promise<void>;
}
