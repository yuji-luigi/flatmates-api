interface IWallet /* extends Document */ {
  _id?: string | undefined;
  amount?: number | undefined;
  user?: string | IUser | undefined;
}
