import { ObjectId } from 'mongodb';
import { MongooseBaseModel } from './base-types/base-model-interface';

export interface VerificationEmailInterface extends MongooseBaseModel {
  email: string;
  invitation?: ObjectId;
  authToken: ObjectId;
  status: EmailVerificationStatus;
}

export const emailVerificationStatuses = ['pending', 'verified', 'outdated'] as const;

export type EmailVerificationStatus = (typeof emailVerificationStatuses)[number];
