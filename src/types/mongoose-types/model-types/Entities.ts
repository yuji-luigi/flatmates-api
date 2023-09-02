export const loginInstanceEntities = ['users', 'maintainers'] as const;
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
  ...loginInstanceEntities
  // 'users',
  // 'maintainers'
] as const;

export type Entities = (typeof entities)[number];
export type LoginInstanceEntities = (typeof loginInstanceEntities)[number];
