import { ObjectId } from 'bson';

export interface MongooseBaseModel {
  _id: ObjectId;
  createdAt: string;
  updatedAt: string;
  // organization?: IOrganization | string;
  setStorageUrlToModel?: () => Promise<void>;
}
