export interface MongooseBaseModel {
  _id: string;
  createdAt: string;
  updatedAt: string;
  // organization?: IOrganization | string;
  setStorageUrlToModel?: () => Promise<void>;
}
