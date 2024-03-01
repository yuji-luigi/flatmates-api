import Role from '../../../models/Role';

const roles = [
  // {
  //   name: 'Inhabitant'
  // },
  // {
  //   name: 'Maintainer'
  // },
  // {
  //   name: 'Administrator'
  // },
  {
    name: 'System Admin'
  }
];

export const seedRoles = async () => {
  await Role.insertMany(roles);
};
