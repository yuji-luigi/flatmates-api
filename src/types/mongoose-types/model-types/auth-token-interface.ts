import { MongooseBaseModel } from './base-types/base-model-interface';
export interface _AuthTokenInterface extends MongooseBaseModel {
  nonce: number;
  linkId: string;
  active: boolean;
  expiresAt: Date;
  validatedAt: Date;
  type?: AuthTokenType;
  isNotValidValidatedAt: () => boolean;
}

export interface EmailAuthTokenInterface extends _AuthTokenInterface {
  type: 'email-verify' | 'password-reset';
  // email: string;
}

export interface InvitationAuthTokenInterface extends _AuthTokenInterface {
  type: 'invitation';
}

export type AuthTokenInterface = EmailAuthTokenInterface | InvitationAuthTokenInterface | _AuthTokenInterface;

export const authTokenTypes = ['email-verify', 'password-reset', 'invitation'] as const;
export type AuthTokenType = (typeof authTokenTypes)[number];
