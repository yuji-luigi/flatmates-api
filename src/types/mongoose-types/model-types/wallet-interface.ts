import { IUser } from './user-interface';

export interface IWallet /* extends Document */ {
  _id?: string | undefined;
  amount?: number | undefined;
  user?: string | IUser | undefined;
}
