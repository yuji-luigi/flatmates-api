import { MongooseBaseModel } from './base-types/base-model-interface';
import { IOrganization } from './organization-interface';
import { IUpload } from './upload-interface';
import { IUser } from './user-interface';

export const spaceTypes = ['country', 'street', 'building', 'area', 'house', 'room', 'floor'] as const;
export type SpaceTypes = (typeof spaceTypes)[number];

export interface ISpace extends MongooseBaseModel {
  name: string;
  /** to show @top level in frontend */
  isHead: boolean;
  // TODO: DEPRECATE THIS. USE SPACETYPE
  isMain: boolean;
  type: SpaceTypes;
  /** only for rootSpace(head) determines how many users can be registered to the space. */
  maxUsers: number;
  /** same order as condoAdmin, companyAdmin, flatAdmin following values. */
  typeOfSpace: TypeOfSpace;
  // spaceType: 'city' | 'district' | 'neighborhood' | 'street' | 'building' | 'floor' | 'space';
  /** now user does not have role as admin, they will be registered as admin in the space. */
  admins: IUser[] | string[] | [];
  /** meaning that this is the end of the chain of spaces.
   *
   * Also meaning that has no children */
  isTail: boolean;
  cover: IUpload;
  /** reference Id to query.
   *
   * click parent do query by parentId and get the children
   */
  parentId?: ISpace | string | null;
  address?: string;
  // floors?: string[];
  password: string;
  // threads?: string[] | IThread[] | undefined;
  /** reference id to query. users can't see other organizations data.(space fund users... etc) */
  organization: string | IOrganization | null;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
  slug: string;
  // maintainers: MaintainerInterface[];
  user?: IUser;
  // set spaces as children in some operations
  children: any;
  getParent(): Promise<ISpace | null | undefined>;
}

export interface ISpaceMethods {
  getParent(): Promise<ISpace | null | undefined>;
  // getChildren(): ISpace[] | [] | null | undefined
  getAncestors(currentDocument: ISpace, children: string[]): Promise<string[] | null | undefined>;
  /** returns root space. */
  getHeadSpace(): Promise<ISpace | null | undefined>;
  /** returns jwt string with expiration and secret */
  token(): string;
}

type TypeOfSpace = 'condominium' | 'officeBuilding' | 'flat';
