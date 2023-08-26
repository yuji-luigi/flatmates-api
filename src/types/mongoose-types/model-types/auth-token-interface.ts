import { MongooseBaseModel } from './base-types/base-model-interface';

export interface AuthTokenInterface extends MongooseBaseModel {
  nonce: number;
  linkId: string;
  active: boolean;
}
