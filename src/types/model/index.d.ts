type Entities =
  | 'bookmarks'
  // | 'buildings'
  | 'comments'
  // | 'floors'
  | 'funds'
  | 'fundRules'
  | 'instances'
  | 'proposals'
  | 'tags'
  | 'threads'
  | 'users'
  | 'userSettings'
  | 'wallets'
  | 'organizations'
  | 'notifications'
  // | 'areas'
  | 'spaces'
  | 'maintainers'
  | 'maintenances';

//  type EntitiesArray = ['bookmarks', 'buildings', 'comments', 'floors', 'funds', 'instances', 'proposals', 'tags', 'threads', 'users', 'userSettings', 'wallets']

type ArrayInObject = {
  [key: string]: any;
};

//  interface IAllSchema
//   extends     IBookmark,
//   IBuilding, IComment, IFloor, IFundRule, IInstance, IProposal, ITag, IThread, IUser, IUserSetting, IWallet, IFund
//      {
//       [key: string]: any
//      }

interface IAllSchema {
  [key: string]: any;
  _id?: string | undefined;
  name?: string;
  address?: string;
  floors?: string[];
  password: string;
  threads?: string[] | IThread[] | undefined;
  fund: string[] | IFund;
  administrator: string | UserModel;
  date?: string | undefined;
  entity?: string | undefined;
  note?: string | undefined;
  description?: string | undefined;
  users?: string[] | IUser[];
  type: 'space' | 'user';
  proposals?: string[] | IProposal[] | undefined;
  executeCondition?: 'every' | 'majority';
  createdBy?: string | IUser | undefined;
  instances?: string | undefined;
  limitInstances?: string[] | undefined;
  buildings?: string[] | IBuilding[] | undefined;
  amount?: number;
  fundRules?: string[] | IFundRule[] | undefined;
  user?: string | IUser | undefined;
  smsNotification: boolean;
  surname?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  role?: string | undefined;
  bookmarks?: string[] | IBookmark[];
  wallet?: string | IWallet;
  userSetting: string | IUserSetting;
  last_login?: Date;
  modules?: modules;
  customer?: string;
  body?: string | undefined;
  attachments?: string[] | undefined;
  tags?: string[] | ITag[];
  building?: string | IBuilding;
  color?: string;

  fundRule?: string | IFundRule | undefined;
}
type AllModels = IAllSchema;
