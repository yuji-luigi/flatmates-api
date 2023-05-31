interface IOrganization extends MongooseBaseModel<null, null> {
  phone: string;
  email: string;
  address: string;
  homepage: string;
  logoBanner?: string;
  logoSquare?: string;
  maintainers: IMaintainer[];
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
  admins: string[] | IUser[];
}
