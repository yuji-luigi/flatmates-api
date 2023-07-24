// const AWS = require('aws-sdk')

// import { writeFileSync } from 'fs';

import {
  // s3Client as s3,
  // streamToString,
  saveInStorage,
  separateFiles,
  createFilesDirName,
  getFolderName
} from '../helpers/uploadFileHelper';

import httpStatus from 'http-status';
import Upload from '../../models/Upload';
import logger from '../../config/logger';
// import vars from '../../config/vars';
import { Response } from 'express';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { UploadResponseObject } from '../helpers/types-uploadFileHelper';
import vars from '../../config/vars';
// const { storageBucketName } = vars;
