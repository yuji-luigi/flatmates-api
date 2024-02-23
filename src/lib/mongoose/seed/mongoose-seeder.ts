import Role from '../../../models/Role';

const roles = [
  {
    name: 'Inhabitant'
  },
  {
    name: 'Maintainer'
  },
  {
    name: 'Administrator'
  }
];

export const seedRoles = async () => {
  await Role.insertMany(roles);
};
