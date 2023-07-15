import { ITag } from '../tag-interface';
import { IUpload } from '../upload-interface';
import { IUser } from '../user-interface';
import { MongooseBaseModel } from './base-model-interface';

export interface PostBaseInterface extends MongooseBaseModel {
  title: string;
  subtitle: string;
  body: string;
  status: PostStatus;
  tags: ITag[] | [];
  // available outside of the organization
  isPublic: boolean;
  private: boolean;
  images: IUpload[] | [];
  attachments: IUpload[] | [];
  sharedWith: IUser[] | [];
  createdBy: IUser | string;
}

const postStatuses = ['draft', 'published', 'deleted'] as const;
export type PostStatus = (typeof postStatuses)[number];
