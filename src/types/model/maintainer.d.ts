interface MaintainerInterface extends MongooseBaseModel<null, null>, LoginInstance {
  name: string;
  company: string;
  cover?: IUpload | string;
  avatar?: IUpload;
  homepage: string;
  type: string;
  tel: string;
  email: string;
  logo: IUpload;
  description: string;
  address: string;
  isIndividual: boolean;
  spaces: ISpace[];
  password: string;
  isInSpace: boolean;
  // organizations: IOrganization[];
  // spaces: ISpaces[];
  createdBy: string | IUser;
}
