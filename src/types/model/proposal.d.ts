interface IProposal /* extends Document */ {
  _id?: string;
  amount?: number | undefined;
  description?: string | undefined;
  fundRule?: string | IFundRule | undefined;
  building?: string | IBuilding;
  proposals?: string[] | IProposal[] | undefined;
  createdBy?: string | IUser | undefined;
  /** decides if everyone in the world can see or only under the organization. */
  isPublic: boolean;
}
