import { IFundRule } from './fundRule-interface';
import { IUser } from './user-interface';

export interface IFund /* extends Document */ {
  _id?: string;
  amount?: number;
  fundRules?: string[] | IFundRule[] | undefined;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
  createdBy?: string | IUser | undefined;
}
