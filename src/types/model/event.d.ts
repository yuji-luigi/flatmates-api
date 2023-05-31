interface IEvent extends MongooseBaseModel<null, null> {
  fromDate?: Date;
  toDate?: Date;
  title: string;
  subtitle: string;
  tags?: ITag[] | undefined;
  status: 'draft' | 'published' | 'deleted';
  private: boolean;
  sharedWith?: IUser[];
  building?: string;
  createdBy?: IUser;
}
