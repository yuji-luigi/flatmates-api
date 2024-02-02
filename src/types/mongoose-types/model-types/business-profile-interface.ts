import { ObjectId } from 'mongoose';

export interface BusinessProfileInterface {
  name: string;
  surname: string;
  company: string;
  avatar?: ObjectId;
  cover?: ObjectId;
  homepage?: string;
  tel?: string;
  email: string;
  logo?: ObjectId;
  description?: string;
  country?: string;
  city?: string;
  street1?: string;
  street2?: string;
  zipCode?: string;
  _role: 'maintainer' | 'administrator';
  user: ObjectId; // todo: can be a string??
}
