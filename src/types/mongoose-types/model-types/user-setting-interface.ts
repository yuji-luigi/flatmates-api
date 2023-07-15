import { IUser } from './user-interface';

export interface IUserSetting {
  _id?: string | undefined;
  pushNotification: boolean;
  smsNotification: boolean;
  user: string | IUser;
}
