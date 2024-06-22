import { ObjectId } from 'mongodb';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { IUser } from './user-interface';
import { AuthTokenInterface } from './auth-token-interface';
import { InvitationInterface } from './invitation-interface';

export interface VerificationEmailInterface extends MongooseBaseModel {
  email: string;
  invitation?: ObjectId;
  user: ObjectId;
  authToken: ObjectId;
  status: EmailVerificationStatus;
}

export const emailVerificationStatuses = ['pending', 'verified', 'outdated'] as const;

export type EmailVerificationStatus = (typeof emailVerificationStatuses)[number];

export type VerificationEmailInterfaceHydrated = VerificationEmailInterface & {
  user: IUser;
  invitation: InvitationInterface;
  authToken: AuthTokenInterface;
};
