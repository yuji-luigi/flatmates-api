import dotenv from 'dotenv';

dotenv.config();

import { S3 } from '@aws-sdk/client-s3';

const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

if (!accessKeyId || !secretAccessKey) {
  throw new Error('AWS credentials are not set');
}

const s3Client = new S3({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

export default s3Client;
