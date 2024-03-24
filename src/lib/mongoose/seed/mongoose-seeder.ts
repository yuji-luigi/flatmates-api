import Role from '../../../models/Role';

const roles = [
  // {
  //   name: 'inhabitant'
  // },
  // {
  //   name: 'maintainer'
  // },
  // {
  //   name: 'property_manager'
  // },
  {
    name: 'system_admin'
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
