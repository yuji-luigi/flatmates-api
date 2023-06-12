interface IThread extends MongooseBaseModel<null, null> {
  _id?: string;
  createdAt: string;
  title: string;
  images: IUpload[] | [];
  listViewType: 'default' | 'bigImage';
  articleType: 'default' | 'blog' | 'news' | 'event' | 'announcement' | 'poll' | 'survey' | 'question' | 'discussion';
  description?: string | undefined;
  attachments: IUpload[] | [];
  isImportant: boolean;
  tags?: string[];
  building?: string | IBuilding;
  rating?: number | undefined;
  // createdBy: IUser;
  user: IUser;
  organization?: IOrganization | string;
  space: ISpace | string;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
}

interface IThreadMethods {
  setStorageUrlToModel: () => Promise<void>;
  /**
   * Deletes thread and all its uploads
   * @returns {Promise<void>}
   */
  handleDeleteUploads: () => Promise<void>;
}
