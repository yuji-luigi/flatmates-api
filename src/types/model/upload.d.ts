interface IUpload extends MongooseBaseModel<null, null>, IUploadMethods {
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
  // setUrl: () => Promise<void>;
}
interface IUploadMethods {
  methods: () => void;
  removeThis: () => Promise<object>;
  deleteFromStorage: () => Promise<void>;
  setUrl: () => Promise<void>;
}
