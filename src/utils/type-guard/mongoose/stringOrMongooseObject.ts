export const getIdString = (objectOrString: string | any): string =>
  typeof objectOrString !== 'string' ? objectOrString._id.toString() : objectOrString.toString();
