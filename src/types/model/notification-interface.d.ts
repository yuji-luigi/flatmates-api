interface INotification extends MongooseBaseModel<null, null> {
  title?: string;
  body: string;
  organization: IOrganization;
}
