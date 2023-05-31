interface IInstance /* extends Document */ {
  _id?: string;
  name?: string | undefined;
  description?: string | undefined;
  users?: string[] | IUser[];
  building?: string | IBuilding;
  /**
   * determines what is this instance.
   * if user, can assign only one user to the instance.
   * if space multiple users can assign to the space.
   */
  type: 'space' | 'user';
  proposals?: string[] | IProposal[] | undefined;
}
