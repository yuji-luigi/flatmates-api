// Imports your configured client and any necessary S3 commands.

import { S3, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ObjectCannedACL, PutObjectCommandInput } from '@aws-sdk/client-s3';

// import { uuid } from 'uuidv4';
import logger from '../../lib/logger';
import vars from '../../utils/globalVariables';
import { formatDateASCII2, replaceHyphens, replaceSpecialChars } from '../../utils/functions';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { replaceSpaces } from '../../utils/functions';
import { uuid } from 'uuidv4';
import { UploadsThread } from './types-uploadFileHelper';
import Upload from '../../models/Upload';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { Request, Response } from 'express';
import { IUpload } from '../../types/mongoose-types/model-types/upload-interface';

const { storageAccessKeyId, storageSecretAccessKey, storageBucketName, storageEndPoint, storageRegion } = vars;

export const s3Client = new S3({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  region: storageRegion,
  endpoint: storageEndPoint,
  credentials: {
    accessKeyId: storageAccessKeyId || '',
    secretAccessKey: storageSecretAccessKey || ''
  }
});

interface FileData {
  data: Buffer;
  encoding: string;
  /** use this as a part of folder also return this to frontend along with fileData to save later correctly  */
  fieldInModel: string;
  md5: string;
  mimetype: string;
  size: number;
  tempFilePath: string;
  trancated: boolean;
  folderName?: string;
}

export const saveInStorage = async function (
  // filesData: Express.Request['files'],
  filesData: FileData[],
  generalDirName = 'noDirName',
  isPrivate = false
  // forSingleField = false
) {
  try {
    const dateNow = new Date();
    const dateASCII = formatDateASCII2(dateNow);
    // const today = formatDateByDash(dateNow);
    // o(n)...🤣
    const result = [];

    for (const key in filesData) {
      // creation of new variables
      const file = filesData[key];
      // Finally create complete directory path
      file.folderName = generalDirName + '/' + file.fieldInModel; // get file
      const uploadModelData = createUploadModelData(file, dateASCII);
      // define full path
      const bucketParams = getBucketParams(file, uploadModelData.fullPath, isPrivate);
      await s3Client.send(new PutObjectCommand(bucketParams));

      result.push(uploadModelData);
    }

    return result;
  } catch (error) {
    // const errorMessage = `Error in saveInStorage function in storageHelper. message:${
    //   error.message || error
    // }`;
    logger.error(error.message || error);
    throw error;
  }
};

export const getBucketParams = (data: any, fullPath: string, isPrivate: boolean): PutObjectCommandInput => {
  // const { folderName, fileName } = data;

  // const key = folderName ? `${folderName}/${fileName}` : fileName; // include folder name in the key if it's provided

  return {
    Bucket: storageBucketName,
    Key: fullPath,
    Body: data.data,
    ContentType: data.mimetype,
    ACL: isPrivate ? ('private' as ObjectCannedACL) : ('public-read' as ObjectCannedACL),
    ContentLength: `${data.size}` as unknown as number,
    Metadata: {
      mimetype: data.mimetype,
      original_filename: data.name,
      size: `${data.size}`
    }
  };
};

export function createUploadModelData(file: any, dateASCII: any) {
  const gui = uuid(); // generate uuid
  const extension = file.name.split('.').pop(); // get file extension
  const formattedFileName = replaceSpecialChars(file.name);
  const newFileName = `${dateASCII}_${gui}_${formattedFileName}`; // define new file name with uuid and date
  // const newFileName = `${dateASCII}_${file.name}`; // define new file name with uuid and date

  const fullPath = file.folderName // this is complete directory path
    ? `${file.folderName}/${newFileName}`
    : newFileName; // define full path
  const formattedFullPath = replaceHyphens(replaceSpaces(fullPath, '_')); // replace spaces with underscores
  // const fullPath = `${file.folderName}/${newFileName}`; // define full path
  return {
    fileName: newFileName,
    /** name before upload */
    originalFileName: file.name,
    /** will be all directories to the file */
    folder: file.folderName,
    extension,
    fullPath: formattedFullPath,
    mineType: file.mimetype,
    size: file.size / 1000,
    // fields for upload model
    fieldInParent: file.fieldInModel
  };
}

export const streamToString = (stream: Readable): Promise<string> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err: Error) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

export const getPrivateUrlOfSpace = async function (obj: any) {
  const signedUrlExpireSeconds = 60 * 5;
  const params = {
    Bucket: storageBucketName,
    Key: obj.params.folder ? `${obj.params.folder}/${obj.params.key}` : obj.params.key,
    Expires: signedUrlExpireSeconds
  };
  const url = await getSignedUrl(s3Client, new GetObjectCommand(params), {
    expiresIn: 60 * 60
  });
  return url;
};

export function separateFiles(files: any) {
  if (files) {
    const regex = /\[\]/g;
    const filesToUpload = [];
    const existingFilesId = [];
    for (const key in files) {
      let file = files[key];
      if (!Array.isArray(file)) {
        file = [file];
      }
      for (const index in file) {
        const singleFile = file[index];
        if (typeof singleFile == 'object') {
          const formattedKey = key.replace(regex, '');
          const editedFile = {
            fieldInModel: formattedKey,
            ...singleFile
          };
          filesToUpload.push(editedFile);
          continue;
        }
        if (typeof singleFile == 'string') {
          existingFilesId.push(singleFile);
          continue;
        }
      }
    }
    return [filesToUpload, existingFilesId];
  }
  // return [[], []];
  throw new Error('No files to upload');
}

export async function deleteFileFromStorage(key: string) {
  try {
    const params = {
      Bucket: storageBucketName,
      Key: key
    };
    const data = await s3Client.send(new DeleteObjectCommand(params));
    logger.info(data);
    return data;
  } catch (error) {
    logger.error(error.message || error);
    throw error;
  }
}

export async function getFileDirName(_req: RequestCustom) {
  // todo: implement this function
  // const organization = await Organization.findById(req.user.organizationId);
  // const orgName = replaceSpecialChars(organization.name || 'super_admin');
  // let nestedDir = req.user.spaceName ? `/${replaceSpecialChars(req.user.spaceName)}` : '';
  // nestedDir += `/${req.params.entity}`;
  // throw new Error('not implemented');
  return `${'orgName'}${'nestedDir'}`;
}

export async function handleImagesAndAttachments(req: RequestCustom): Promise<{ images: IUpload[]; attachments: IUpload[] }> {
  try {
    const [filesToUpload] = separateFiles(req.files);
    const generalDirName = await getFileDirName(req);
    const uploadModelsData = await saveInStorage(filesToUpload, generalDirName);
    const uploads: UploadsThread = { images: [], attachments: [] };

    for (const key in uploadModelsData) {
      const data = uploadModelsData[key];
      const createdModel = await Upload.create(data);
      // uploadModelIds.push(createdModel._id.toString());
      uploads[data.fieldInParent].push(createdModel);
    }
    const { images } = uploads;
    const { attachments } = uploads;

    return { images, attachments };
  } catch (error) {
    logger.error(error.message || error);
    throw error;
  }
}

// test to make all uploads public
export async function makeAllPublic(_req: Request, res: Response) {
  try {
    // const uploads = await Upload.find();
    // for (const upload of uploads) {
    //   const params = {
    //     Bucket: storageBucketName,
    //     Key: upload.fullPath,
    //     ACL: 'public-read'
    //   };
    // await s3Client.send(new PutObjectCommand(params));
    // }
    res.send('hacker!!');
  } catch (error) {
    logger.error(error.message || error);
    throw error;
  }
}

export const getFolderName = (body: any) => {
  const { organizationName, space, entity } = body;
  const folderName = `${replaceSpecialChars(organizationName)}/${replaceSpecialChars(space)}/${entity}`;
  return folderName;
};
