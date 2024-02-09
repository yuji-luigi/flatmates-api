import { MongooseBaseModel } from './base-types/base-model-interface';

export const roles = ['inhabitant', 'maintainer', 'administrator'];
export type RoleFields = (typeof roles)[number];
export interface RoleInterface extends MongooseBaseModel {
  name: string;
}
