interface ISpace extends MongooseBaseModel<ISpace, ISpace> {
  cover: IUpload;
  avatar: IUpload;
  /** to show @top level in frontend */
  isHead: boolean;
  /** meaning that this is the end of the chain of spaces.
   *
   * Also meaning that has no children */
  isTail: boolean;
  isMain: boolean;
  /** reference Id to query.
   *
   * click parent do query by parentId and get the children
   */
  parentId?: ISpace | string | null;
  address?: string;
  // floors?: string[];
  password: string;
  // threads?: string[] | IThread[] | undefined;
  spaceType: 'city' | 'district' | 'neighborhood' | 'street' | 'building' | 'floor' | 'space';
  /** reference id to query. users can't see other organizations data.(space fund users... etc) */
  organization: string | IOrganization | null;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
  //   getParent(): ISpace | null | undefined;
  // getParent(): Promise<ISpace | null | undefined>;
  // // getChildren(): ISpace[] | [] | null | undefined
  //// getAncestors(currentDocument: ISpace,children: string[]): string[]| null | undefined
}

interface ISpaceMethods {
  getParent(): Pormise<ISpace | null | undefined>;
  // getChildren(): ISpace[] | [] | null | undefined
  getAncestors(currentDocument: ISpace, children: string[]): Promise<string[] | null | undefined>;
  /** returns root space. */
  getHeadSpace(): Promise<ISpace | null | undefined>;
  token: () => string;
}
