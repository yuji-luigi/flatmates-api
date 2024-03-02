import { ObjectId } from 'mongoose';
import { PostBaseInterface } from './base-types/post-base-interface';
import { ISpace } from './space-interface';
import { IUpload } from './upload-interface';
import { IUser } from './user-interface';

export interface IThread extends PostBaseInterface {
  description: string;
  attachments: IUpload[] | [];
  rating?: number | undefined;
  createdBy: IUser;
  spaces: ISpace[] | ObjectId[];
  isImportant?: boolean;
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
