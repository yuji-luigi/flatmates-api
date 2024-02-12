export const entities = [
  'bookmarks',
  'comments',
  'funds',
  'fundRules',
  'instances',
  'proposals',
  'tags',
  'threads',
  'userSettings',
  'wallets',
  'organizations',
  'notifications',
  'spaces',
  'maintenances',
  'checks',
  'auth-tokens',
  'spaceTags',
  'roles',
  'users',
  'maintenances'
  // ...loginInstanceEntities
  // 'users',
  // 'maintainers'
] as const;
export type Entities = (typeof entities)[number];

export const ENTITIES = entities.reduce<Partial<Record<Entities, Entities>>>((acc, entity) => {
  acc[entity] = entity;
  return acc;
}, {});
