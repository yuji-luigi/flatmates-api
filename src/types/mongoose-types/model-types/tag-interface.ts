import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';

export interface ITag {
  _id?: string;
  name?: string;
  description?: string;
  color?: string;
  mainSpace: ISpace;
  organization?: string | IOrganization;
}
