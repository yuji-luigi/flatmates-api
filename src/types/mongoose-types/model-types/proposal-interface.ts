import { IFundRule } from './fundRule-interface';
import { IOrganization } from './organization-interface';
import { ISpace } from './space-interface';
import { IUser } from './user-interface';

export interface IProposal /* extends Document */ {
  _id?: string;
  amount?: number | undefined;
  space: ISpace;
  description?: string | undefined;
  fundRule?: string | IFundRule | undefined;
  proposals?: string[] | IProposal[] | undefined;
  createdBy?: string | IUser | undefined;
  organization: IOrganization;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
}
