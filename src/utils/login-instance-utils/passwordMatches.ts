import bcrypt from 'bcrypt';
import { LoginInstanceProperties } from '../../types/universal-mongoose-model/user-base-interface';
export async function passwordMatches({ password, loginInstance }: { password: string; loginInstance: LoginInstanceProperties }) {
  return await bcrypt.compare(password, loginInstance.password);
}
