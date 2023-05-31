interface IFundRule /* extends Document */ {
  _id?: string;
  executeCondition?: 'every' | 'majority';
  building?: string | IBuilding | undefined;
  space?: string | ISpace | undefined;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
  createdBy?: string | IUser | undefined;
}
