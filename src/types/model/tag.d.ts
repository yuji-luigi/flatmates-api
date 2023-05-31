interface ITag {
  _id?: string;
  name?: string;
  description?: string;
  color?: string;
  building?: string | IBuilding;
  organization?: string | IOrganization;
}
