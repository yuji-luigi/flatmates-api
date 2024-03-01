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
export async function initSeed() {
  // const [, errRole] = await seedRoles();
  // errRole&& console.error('errRole', errRole);
}
export const seedRoles = async () => {
  await Role.insertMany(roles).catch((err) => [null, err]);
  return ['ok', null];
};
