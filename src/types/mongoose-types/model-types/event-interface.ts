import { PostBaseInterface } from './base-types/post-base-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';

export interface IEvent extends PostBaseInterface {
  space: ISpace;
  organization: string | IOrganization;
  fromDate: Date;
  toDate: Date;
}
