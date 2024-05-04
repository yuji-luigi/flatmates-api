import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import { Entities } from '../mongoose-types/model-types/Entities';
import { RoleName } from '../mongoose-types/model-types/role-interface';
import { ObjectId } from 'mongodb';
import { ParsedQs as OriginalParsedQs } from 'qs';
// custom-types.d.ts
// import { ParamsDictionary } from 'express-serve-static-core';

declare module 'express' {
  interface Request {
    user: ReqUser | undefined;
    maintenance?: IMaintenance;
  }
}

declare module 'express-serve-static-core' {
  interface ParamsDictionary {
    id?: string;
    userId?: string;
    spaceId?: string;
    slug?: string;
    entity: Entities;
    userType?: RoleName;
    linkId?: string;
  }
}

declare module 'qs' {
  interface ParsedQs extends OriginalParsedQs {
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
    parentId?: ObjectId | string;
    [key?: string]: string | boolean;
  }
}

// interface TypedRequestBody<T, U> extends Request {
//   params: { [key: string]: string };
//   logIn: (userId: string | IUser) => Promise<void>;
//   body: T;
//   user: U;
//   query?: { [key: string]: string | number | boolean | object | undefined };
// }

export type QueryReturnType = object | string | number | boolean | ObjectId | undefined;

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
  entity: Entities;
  userType?: RoleName;
  userId?: string;
  parentId?: string;
  spaceId?: string;
  slug?: string;
}

export interface QueryCustom {
  [key: string]: boolean | undefined | string | string[] | ParsedQs | ParsedQs[];
}

// export type RequestCustom = Request;
export interface RequestCustom<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = QueryCustom,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: ReqUser | undefined;
  params: ParamsInterface;
  maintenance?: IMaintenance;
}

export type RequestWithFiles = RequestCustom & { files: UploadedFile[] };

export interface LoggedInRequest<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = QueryCustom,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user: ReqUser | undefined;
  // user?: (IUser & { spaceId?: ObjectId; spaceName?: string; organizationId: ObjectId }) | undefined;
  // space?: ISpace | null;
  // organization: IOrganization;
  maintenance?: IMaintenance;
  // files?: File[];
  // query: QueryInterface;
}
