import { ObjectId } from 'mongodb';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { IUser } from './user-interface';
import { AuthTokenInterface } from './auth-token-interface';
import { InvitationInterface } from './invitation-interface';

export interface VerificationEmailInterface extends MongooseBaseModel {
  invitation?: ObjectId;
  user: ObjectId;
  authToken: ObjectId;
  status: EmailVerificationStatus;
  type: VerificationEmailType;
}

export const verificationEmailTypes = ['email-verify', 'email-change', 'password-forgot', 'unit-register-email-verification'] as const;
export type VerificationEmailType = (typeof verificationEmailTypes)[number];
export const emailVerificationStatuses = ['pending', 'verified', 'expired'] as const;

export type EmailVerificationStatus = (typeof emailVerificationStatuses)[number];

export type VerificationEmailInterfaceHydrated = VerificationEmailInterface & {
  user: IUser;
  invitation: InvitationInterface;
  authToken: AuthTokenInterface;
};
