interface MongooseBaseModel<ParentEntity, ChildEntity> {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  children?: Array<ChildEntity> | null | undefined;
  parent?: ParentEntity | null | undefined;
  createdAt: string;
  updatedAt: string;
  // organization?: IOrganization | string;
  setStorageUrlToModel?: () => Promise<void>;
}

/** not sure if its a good idea but all properties combined together. */
interface AllModelInterface {
  _id?: string;
  name?: string;
  title?: string;
  children?: Array<ChildEntity> | null | undefined;
  parent?: ParentEntity | null | undefined;
  organization: IOrganization | string;
  building?: string | IBuilding;
  amount?: number | undefined;
  user?: string | IUser | undefined;
  date?: string | undefined;
  entity?: string | undefined;
  threads?: string[] | undefined;
  note?: string | undefined;
  address?: string;
  floors?: string[];
  fund: string[] | IFund;
  administrator?: string | IUser | null;
  body?: string;
  fromDate?: Date;
  toDate?: Date;
  title: string;
  subtitle: string;
  tags?: ITag[] | undefined;
  status: 'draft' | 'published' | 'deleted';
  private: boolean;
  sharedWith?: IUser[];
  createdBy?: IUser;
  instances?: string | undefined;
  limitInstances?: string[] | undefined;
  fundRules?: string[] | IFundRule[] | undefined;

  executeCondition?: 'every' | 'majority';
  description?: string | undefined;
  users?: string[] | IUser[];
  type: 'space' | 'user';
  proposals?: string[] | IProposal[] | undefined;
  quantity?: number | undefined;
  price?: number | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  phone: string;
  email: string;
  homepage: string;
  logoBanner?: string;
  logoSquare?: string;
  attachments?: string[] | undefined;
  surname?: string | undefined;
  password: string;
  role?: string | undefined;
  bookmarks?: string[];
  wallet?: string;
  userSetting: string | boolean;
  last_login?: Date;
  modules?: modules;
  customer?: string;
  _update?: {
    password?: Buffer | string;
  };
  token(): () => string;
  /*   roles: string[] | any;
   */
}
