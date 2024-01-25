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
  address?: string;
  _role: 'maintainer' | 'administrator';
}
