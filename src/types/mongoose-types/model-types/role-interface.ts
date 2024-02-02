import { isSuperAdmin } from './../../../models/User';
import { ObjectId } from 'bson';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { BusinessProfileInterface } from './business-profile-interface';
import { ISpace } from './space-interface';
import { IOrganization } from './organization-interface';

type BelongToFields = {
  hasAccess: boolean;
  rootSpaces: ObjectId[] /* | ISpace[]; */;
  organizations: ObjectId[] /*  | IOrganization[]; */;
};

type RoleBaseFields = BelongToFields;
export type RoleFields = 'inhabitant' | 'maintainer' | 'administrator';
export interface RoleInterface extends MongooseBaseModel {
  inhabitant?: RoleBaseFields;
  maintainer?: RoleBaseFields & { profile: BusinessProfileInterface | ObjectId };
  administrator?: RoleBaseFields & { profile: BusinessProfileInterface | ObjectId };
  isSuperAdmin: boolean;
}
