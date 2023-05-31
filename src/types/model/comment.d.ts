interface IComment {
  _id?: string;
  title: string;
  body?: string;
  private: boolean;
  anonymous: boolean;
  password: string;
  // fund: string[] | IFund;
  space: string | ISpace;
  area?: string | IArea;
  instance?: string | IInstance;
  createdBy: string | IUser;
  organization: string | IOrganization | undefined;
}
