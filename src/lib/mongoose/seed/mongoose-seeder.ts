import Role from '../../../models/Role';
import User from '../../../models/User';
import { roles } from '../../../types/mongoose-types/model-types/role-interface';
import { UserBase } from '../../../types/mongoose-types/model-types/user-interface';
import { ErrorCustom } from '../../ErrorCustom';

//  TODO: ELIMINATE ROLE COLLECTION AND USE THIS ROLES AS USERTYPE.
// TODO:  CHANGE ALL ACCESS_PERMISSIONS.ROLES TO BE  ROLE.NAME
// TODO: ROLE WILL BE USER TYPE

const mockUsers: Omit<UserBase, '_id' | 'slug'>[] = [
  {
    name: 'Super Admin',
    surname: 'Demo',
    email: 'super@demo.com',
    password: 'user$$$',
    isSuperAdmin: true,
    phone: '1234567890',
    active: true,
    locale: 'it'
  }
];

export async function initSeed() {
  // await seedUsers();
  // await seedRoles();
}

export const seedRoles = async () => {
  for (const role of roles) {
    await Role.create(role).catch((err) => console.error('err', err));
  }
};
export const seedUsers = async () => {
  try {
    for (const user of mockUsers) {
      await User.create(user);
    }
  } catch (error) {
    throw new ErrorCustom('Error seeding users', 500, error.message);
  }
};
