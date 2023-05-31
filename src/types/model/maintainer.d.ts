interface MaintainerInterface extends MongooseBaseModel<null, null> {
  name: string;
  company: string;
  cover?: IUpload | string;
  avatar?: IUpload | string;
  homepage: string;
  type: string;
  tel: string;
  email: string;
  logo: IUpload;
  description: string;
  address: string;
  isIndividual: boolean;
  // organizations: IOrganization[];
  // spaces: ISpaces[];
  createdBy: string | IUser;
}
