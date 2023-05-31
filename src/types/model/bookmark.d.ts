interface IBookmark extends MongooseBaseModel<null, null> {
  // _id?: string | undefined;
  date?: string | undefined;
  entity?: string | undefined;
  threads?: string[] | undefined;
  note?: string | undefined;
  building?: string;
  organization: IOrganization;
}
