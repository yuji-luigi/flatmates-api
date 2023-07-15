import { MongooseBaseModel } from './base-model-interface';
import { ITag } from './tag-interface';
import { IUser } from './user-interface';

export interface IEvent extends MongooseBaseModel {
  fromDate?: Date;
  toDate?: Date;
  title: string;
  subtitle: string;
  tags?: ITag[] | undefined;
  status: 'draft' | 'published' | 'deleted';
  private: boolean;
  sharedWith?: IUser[];
  building?: string;
  createdBy?: IUser;
}
