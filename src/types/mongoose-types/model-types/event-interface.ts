import { PostBaseInterface } from './base-types/post-base-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';

export interface IEvent extends PostBaseInterface {
  mainSpace: ISpace;
  space?: string | ISpace;
  organization: string | IOrganization;
  fromDate: Date;
  toDate: Date;
}
