import { IUpload } from '../../types/mongoose-types/model-types/upload-interface';

export interface UploadsThread {
  [key: string]: IUpload[];
  images: IUpload[];
  attachments: IUpload[];
}

export interface UploadResponseObject {
  [key: string]: string[];
}
