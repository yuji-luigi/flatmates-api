import { MongooseBaseModel } from './base-types/base-model-interface';
import { IUser } from './user-interface';

export interface IUpload extends MongooseBaseModel, IUploadMethods {
  // _id?: string | undefined;
  fileName: string;
  originalFileName: string;
  extension: string;
  folder?: string | undefined;
  fieldInParent: string;
  /** equivalent to key for the storage. includes all dir names and file name.extension */
  fullPath: string;
  mimetype?: string | undefined;
  size: number;
  url?: string | undefined;
  uploadedBy?: IUser | string | undefined;
  ACL?: string | undefined;
  // setUrl: () => Promise<void>;
}
export interface IUploadMethods {
  methods: () => void;
  removeThis: () => Promise<IUpload | null>;
  deleteFromStorage: () => Promise<void>;
  setUrl: (compact?: boolean) => Promise<void>;
  getUrl: (compact?: boolean) => Promise<string | undefined>;
}
