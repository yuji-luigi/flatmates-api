import { Request } from 'express';

interface TypedRequestBody<T, U> extends Request {
  params: { [key: string]: string };
  logIn: (userId: string | IUser) => Promise<void>;
  body: T;
  user: U;
  query?: { [key: string]: string | number | boolean | object | undefined };
}

type QueryReturnType = object | string | number | boolean | undefined;

// interface RequestCustom extends RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>> {
//   logIn: (userId: string | IUser) => Promise<void>;
//   user?: IUser;
//   params: {
//     [key: string]: string
//     idMongoose?: string;
//     id?: string;
//     userId?: string
//    };
//   query?: {
//     spaces?: QueryReturnType;
//     users?: QueryReturnType;
//     proposals?: QueryReturnType;
//     funds?: QueryReturnType;
//     fundRules?: QueryReturnType;
//     instances?: QueryReturnType;
//     threads?: QueryReturnType;
//     comments?: QueryReturnType;
//     tags?: QueryReturnType;
//     bookmarks?: QueryReturnType;
//     wallets?: QueryReturnType;
//     userSettings?: QueryReturnType;
//     space?: QueryReturnType;
//     user?: QueryReturnType;
//     proposal?: QueryReturnType;
//     fund?: QueryReturnType;
//     fundRule?: QueryReturnType;
//     instance?: QueryReturnType;
//     thread?: QueryReturnType;
//     comment?: QueryReturnType;
//     tag?: QueryReturnType;
//     bookmark?: QueryReturnType;
//     wallet?: QueryReturnType;
//     userSetting?: QueryReturnType;
//     [key?: string]: QueryReturnType | undefined;
//    };
// }
interface QueryInterface {
  spaces?: QueryReturnType;
  users?: QueryReturnType;
  proposals?: QueryReturnType;
  funds?: QueryReturnType;
  fundRules?: QueryReturnType;
  instances?: QueryReturnType;
  threads?: QueryReturnType;
  comments?: QueryReturnType;
  tags?: QueryReturnType;
  bookmarks?: QueryReturnType;
  wallets?: QueryReturnType;
  userSettings?: QueryReturnType;
  space?: QueryReturnType;
  user?: QueryReturnType;
  proposal?: QueryReturnType;
  fund?: QueryReturnType;
  fundRule?: QueryReturnType;
  instance?: QueryReturnType;
  thread?: QueryReturnType;
  comment?: QueryReturnType;
  tag?: QueryReturnType;
  bookmark?: QueryReturnType;
  wallet?: QueryReturnType;
  userSetting?: QueryReturnType;
  [key?: string]: QueryReturnType | undefined;
}

interface ParamsInterface {
  [key: string]: string;
  idMongoose?: string;
  id?: string;
  userId?: string;
}

export interface QueryCustom {
  [key: string]: boolean | undefined | string | string[] | ParsedQs | ParsedQs[];
}

export interface RequestCustom<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = QueryCustom,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: IUser | undefined;
  // space?: ISpace | null;
  // organization: IOrganization;
  maintenance?: IMaintenance;
  // files?: File[];
  // query: QueryInterface;
}
