import { ObjectId } from 'mongoose';
import { MongooseBaseModel } from './base-types/base-model-interface';
import { IUser } from './user-interface';
import { BusinessProfileInterface } from './business-profile-interface';
import { ISpace } from './space-interface';
import { IOrganization } from './organization-interface';

type BelongToFields = {
  hasAccess: boolean;
  rootSpaces: ObjectId[] | ISpace[];
  organizations: ObjectId[] | IOrganization[];
};

type RoleBaseFields = BelongToFields;

export interface RoleInterface extends MongooseBaseModel {
  inhabitant?: RoleBaseFields;
  maintainer?: {
    type: string;
  } & RoleBaseFields &
    BusinessProfileInterface;
  administrator?: RoleBaseFields & BusinessProfileInterface;
}
