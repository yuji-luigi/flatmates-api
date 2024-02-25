import { Entities } from './Entities';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUser } from './user-interface';

export interface IComment {
  _id: string;
  body?: string;
  private: boolean;
  anonymous: boolean;
  space: ISpace;
  parentEntity: Entities;
  organization: string | IOrganization | undefined;
  createdBy: string | IUser;
}
