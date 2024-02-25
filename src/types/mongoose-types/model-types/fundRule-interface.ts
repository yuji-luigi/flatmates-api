import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUser } from './user-interface';

export interface IFundRule /* extends Document */ {
  _id?: string;
  executeCondition?: 'every' | 'majority';
  space?: string | ISpace | undefined;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
  organization: IOrganization;
  createdBy?: string | IUser | undefined;
}
