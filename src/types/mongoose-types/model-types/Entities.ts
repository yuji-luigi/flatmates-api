const entities = [
  'bookmarks',
  'comments',
  'funds',
  'fundRules',
  'instances',
  'proposals',
  'tags',
  'threads',
  'users',
  'userSettings',
  'wallets',
  'organizations',
  'notifications',
  'spaces',
  'maintainers',
  'maintenances',
  'checks'
] as const;

export type Entities = (typeof entities)[number];
