export const loginInstanceEntities = ['users', 'maintainers', 'maintenances'] as const;
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
  'role',
  ...loginInstanceEntities
  // 'users',
  // 'maintainers'
] as const;
export type Entities = (typeof entities)[number];
export type LoginInstanceEntities = (typeof loginInstanceEntities)[number];

export const ENTITIES = entities.reduce<Partial<Record<Entities, Entities>>>((acc, entity) => {
  acc[entity] = entity;
  return acc;
}, {});
